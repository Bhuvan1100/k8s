import time
import uuid
import json
from datetime import datetime, timedelta

from app.db.session import SessionLocal
from app.db.models import PricingEvaluationBatch, PricingMemory
from app.services.redis_service import RedisService
from app.evaluation.engine import evaluate_variant


def run_scheduler(compiled_graph):
    print("\n[SCHEDULER] 🚀 Starting scheduler run...", flush=True)

    db = SessionLocal()
    redis_service = RedisService()

    batch_id = str(uuid.uuid4())
    batch = None

    try:
        # ==============================
        # CREATE BATCH
        # ==============================
        batch = PricingEvaluationBatch(
            id=batch_id,
            status="RUNNING",
            total_variants=0,
            processed_variants=0,
            proposals_created=0
        )
        db.add(batch)
        db.commit()
        print(f"[BATCH] Created batch {batch_id}", flush=True)

        # ==============================
        # STEP 1: HIGH DEMAND VARIANTS
        # ==============================
        active_variants = redis_service.get_active_variants(limit=100) or []
        high_demand_ids = [v[0] for v in active_variants]

        print(f"[REDIS] High demand variants: {len(high_demand_ids)}", flush=True)

        # ==============================
        # STEP 2: RECENTLY MODIFIED
        # ==============================
        monitor_window = datetime.utcnow() - timedelta(hours=24)

        monitored_variants = (
            db.query(PricingMemory.variant_id)
            .filter(PricingMemory.last_price_change_at != None)
            .filter(PricingMemory.last_price_change_at >= monitor_window)
            .all()
        )

        monitored_ids = [v[0] for v in monitored_variants]

        print(f"[DB] Recently modified variants: {len(monitored_ids)}", flush=True)

        # ==============================
        # STEP 3: MERGE (PRIORITY ORDER)
        # ==============================
        combined_ids = high_demand_ids + [
            vid for vid in monitored_ids if vid not in high_demand_ids
        ]

        batch.total_variants = len(combined_ids)
        db.commit()

        proposals_count = 0

        # ==============================
        # STEP 4: PROCESS LOOP
        # ==============================
        for variant_id in combined_ids:
            print(f"\n[VARIANT] Processing: {variant_id}", flush=True)

            try:
                now = int(time.time())
                cutoff = now - 86400

                # Cleanup old events
                redis_service.client.zremrangebyscore(
                    f"cart_events:{variant_id}", 0, cutoff
                )
                redis_service.client.zremrangebyscore(
                    f"sold_events:{variant_id}", 0, cutoff
                )

                # Fetch 24h events
                cart_events = redis_service.client.zrangebyscore(
                    f"cart_events:{variant_id}", cutoff, now
                )

                sold_events = redis_service.client.zrangebyscore(
                    f"sold_events:{variant_id}", cutoff, now
                )

                # ==============================
                # QUANTITY-AWARE COUNTING
                # ==============================
                cart_count = 0
                for event in cart_events:
                    try:
                        parsed = json.loads(event)
                        cart_count += parsed.get("quantity", 1)
                    except Exception:
                        # backward compatibility (old entries)
                        cart_count += 1

                sold_count = 0
                for event in sold_events:
                    try:
                        parsed = json.loads(event)
                        sold_count += parsed.get("quantity", 1)
                    except Exception:
                        sold_count += 1

                total_score = (1 * cart_count) + (2 * sold_count)

                # Update demand ranking score
                redis_service.client.zadd(
                    "variant_activity_score",
                    {variant_id: total_score}
                )

                print(
                    f"[ACTIVITY] cart={cart_count}, sold={sold_count}, score={total_score}",
                    flush=True
                )

                # Skip dead + not monitored
                if total_score <= 0 and variant_id not in monitored_ids:
                    print("[SKIP] No demand and not monitored", flush=True)
                    continue

            except Exception as e:
                print(f"[ERROR] Redis processing failed: {e}", flush=True)
                continue

            # ==============================
            # LOCKING
            # ==============================
            lock_key = f"eval_lock:{variant_id}"
            lock_acquired = redis_service.client.set(
                lock_key,
                "1",
                nx=True,
                ex=3600  # 1 hour throttle
            )

            if not lock_acquired:
                print("[LOCK] Recently processed, skipping", flush=True)
                continue

            print("[LOCK] Acquired", flush=True)

            # ==============================
            # EVALUATION
            # ==============================
            try:
                proposal_created = evaluate_variant(
                    compiled_graph=compiled_graph,
                    variant_id=variant_id,
                    batch_id=batch_id
                )
                print(f"[EVALUATION] Proposal created: {proposal_created}", flush=True)

            except Exception as e:
                print(f"[ERROR] evaluate_variant failed: {e}", flush=True)
                proposal_created = False

            # ==============================
            # BATCH UPDATE
            # ==============================
            batch.processed_variants += 1

            if proposal_created:
                proposals_count += 1
                batch.proposals_created = proposals_count

            db.commit()

            print(
                f"[BATCH] Progress: {batch.processed_variants}/{batch.total_variants}",
                flush=True
            )

        # ==============================
        # FINALIZE
        # ==============================
        batch.status = "COMPLETED"
        batch.completed_at = datetime.utcnow()
        db.commit()

        print(f"\n[SCHEDULER] ✅ Completed batch {batch_id}", flush=True)
        print(f"[SUMMARY] Proposals created: {proposals_count}", flush=True)

    except Exception as e:
        print(f"\n[SCHEDULER] ❌ FATAL ERROR in batch {batch_id}: {e}", flush=True)

        if batch:
            batch.status = "FAILED"
            db.commit()

        raise

    finally:
        db.close()
        print("[SCHEDULER] 🔒 DB session closed\n", flush=True)