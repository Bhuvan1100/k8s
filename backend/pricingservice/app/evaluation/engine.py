import time
import uuid
import json
import requests

from app.services.redis_service import RedisService
from app.db.session import SessionLocal
from app.db.models import PricingMetricsSnapshot, PricingMemory
from app.evaluation.pricing_graph import run_pricing_flow


def evaluate_variant(compiled_graph, variant_id: str, batch_id: str):
    print(f"[EVAL] ▶ Starting evaluation for {variant_id}", flush=True)

    db = SessionLocal()
    redis_service = RedisService()

    try:
        # ==============================
        # METRICS FROM REDIS (QUANTITY AWARE)
        # ==============================
        try:
            now = int(time.time())
            start_time = now - 86400

            # Fetch events
            cart_events = redis_service.client.zrangebyscore(
                f"cart_events:{variant_id}",
                start_time,
                now
            )

            sold_events = redis_service.client.zrangebyscore(
                f"sold_events:{variant_id}",
                start_time,
                now
            )

            # Sum quantities
            cart_count_1d = 0
            for event in cart_events:
                try:
                    parsed = json.loads(event)
                    cart_count_1d += parsed.get("quantity", 1)
                except Exception:
                    # backward compatibility
                    cart_count_1d += 1

            sold_count_1d = 0
            for event in sold_events:
                try:
                    parsed = json.loads(event)
                    sold_count_1d += parsed.get("quantity", 1)
                except Exception:
                    sold_count_1d += 1

            activity_score = redis_service.client.zscore(
                "variant_activity_score",
                variant_id
            ) or 0

            activity_score = float(activity_score or 0)

            print(
                f"[METRICS] cart={cart_count_1d}, sold={sold_count_1d}, score={activity_score}",
                flush=True
            )

        except Exception as e:
            print(f"[EVAL ERROR] Redis metrics failed for {variant_id}: {e}", flush=True)
            raise

        # ==============================
        # PRODUCT SERVICE CALL
        # ==============================
        try:
            product_response = requests.post(
                "http://productservice:4003/internal/variants/pricing-context",
                json={"variantId": variant_id},
                headers={
                    "x-request-id": str(uuid.uuid4()),
                    "x-admin": "true"
                },
                timeout=20
            )

            if product_response.status_code != 200:
                print(f"[ERROR] Product service failed for {variant_id} status={product_response.status_code}", flush=True)
                return False

            product_data = product_response.json()
            print(f"[PRODUCT] price={product_data['currentPrice']}", flush=True)

        except requests.exceptions.Timeout:
            print(f"[EVAL ERROR] Product service timeout for {variant_id}", flush=True)
            return False
        except Exception as e:
            print(f"[EVAL ERROR] Product service exception for {variant_id}: {e}", flush=True)
            return False

        # ==============================
        # SNAPSHOT CREATION
        # ==============================
        try:
            metrics_snapshot = {
                "variant_id": variant_id,
                "cart_count_1d": cart_count_1d,
                "sold_count_1d": sold_count_1d,
                "activity_score": activity_score,
                "current_price": product_data["currentPrice"],
                "lower_limit": product_data["lowerLimit"],
                "upper_limit": product_data["upperLimit"],
                "total_quantity": product_data["totalQuantity"],
                "reserved_quantity": product_data["reservedQuantity"],
                "available_quantity": product_data["availableQuantity"],
                "evaluation_timestamp": now
            }

            snapshot_row = PricingMetricsSnapshot(
                id=str(uuid.uuid4()),
                variant_id=variant_id,
                batch_id=batch_id,
                metrics_json=metrics_snapshot
            )

            db.add(snapshot_row)
            db.commit()

            print(f"[DB] Snapshot stored: {snapshot_row.id}", flush=True)

            metrics_snapshot["metrics_snapshot_id"] = snapshot_row.id

        except Exception as e:
            print(f"[EVAL ERROR] Snapshot DB insert failed for {variant_id}: {e}", flush=True)
            raise

        # ==============================
        # MEMORY FETCH
        # ==============================
        try:
            memory_row = (
                db.query(PricingMemory)
                .filter(PricingMemory.variant_id == variant_id)
                .first()
            )

            memory = {}

            if memory_row:
                print("[MEMORY] Existing memory found", flush=True)
                memory = {
                    "last_strategy": memory_row.last_strategy,
                    "last_market_state": memory_row.last_market_state,
                    "last_price": float(memory_row.last_price) if memory_row.last_price else None,
                    "last_price_change_at": memory_row.last_price_change_at,
                    "cooldown_until": memory_row.cooldown_until,
                    "oscillation_score": memory_row.oscillation_score,
                    "stability_index": float(memory_row.stability_index)
                }
            else:
                print("[MEMORY] No memory found (first run)", flush=True)

        except Exception as e:
            print(f"[EVAL ERROR] Memory fetch failed for {variant_id}: {e}", flush=True)
            raise

        # ==============================
        # PRICING FLOW
        # ==============================
        try:
            result = run_pricing_flow(
                compiled_graph=compiled_graph,
                variant_id=variant_id,
                batch_id=batch_id,
                snapshot=metrics_snapshot,
                memory=memory
            )

        except Exception as e:
            print(f"[EVAL ERROR] Pricing flow failed for {variant_id}: {e}", flush=True)
            raise

        # ==============================
        # RESULT CHECK
        # ==============================
        if result and "__interrupt__" in result:
            interrupt_obj = result["__interrupt__"][0]
            proposal_id = interrupt_obj.value["proposal_id"]
            print(f"[FLOW] Proposal created (interrupt): {proposal_id}")
            return True

        print("[FLOW] No proposal created", flush=True)
        return False

    except Exception as e:
        print(f"[EVAL FATAL] {variant_id} -> {str(e)}", flush=True)
        return False

    finally:
        db.close()
        print(f"[EVAL] ◀ Finished evaluation for {variant_id}", flush=True)
