from dotenv import load_dotenv
from langgraph.graph import StateGraph, START, END
from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel
from typing import TypedDict, Literal, Optional
from langgraph.types import interrupt
from datetime import datetime, timedelta, timezone
import uuid
import requests
import traceback

from app.ai.llm import get_llm
from app.db.session import SessionLocal
from app.db.models import (
    PricingAIStage1Log,
    PricingAIStage2Log,
    PricingProposal,
    PricingPriceHistory,
    PricingMemory,
    ProposalStatus
)

load_dotenv()
llm = get_llm()


# ===========================
# STATE
# ===========================

class PricingGraphState(TypedDict, total=False):
    variant_id: str
    batch_id: str
    snapshot: dict
    memory: dict
    market_state: Optional[str]
    strategy: Optional[str]
    aggressiveness: Optional[int]
    confidence: Optional[float]
    proposed_price: Optional[float]
    create_proposal: Optional[bool]
    approval_decision: Optional[str]
    proposal_id: Optional[str]
    stage2_log_id: Optional[str]


# ===========================
# LLM RESPONSE MODELS
# ===========================

class Stage1Response(BaseModel):
    market_state: Literal[
        "HIGH_DEMAND",
        "LOW_DEMAND",
        "NORMAL",
        "OVERSTOCK",
        "DEMAND_SPIKE",
        "STAGNANT"
    ]
    raw_response: str


class Stage2Response(BaseModel):
    strategy: Literal["RAISE", "LOWER", "HOLD"]
    aggressiveness: int
    confidence: float
    raw_response: str


model1 = llm.with_structured_output(Stage1Response)
model2 = llm.with_structured_output(Stage2Response)


# ===========================
# NODES
# ===========================

def know_market_state(state: PricingGraphState):
    print("\n[know_market_state] START", state)
    try:
        messages = [
            SystemMessage(
                content="Classify the market condition strictly into one allowed category and if the cart count is high then be sure to high price in high condition."
            ),
            HumanMessage(
                content=f"SNAPSHOT:\n{state['snapshot']}\n\nMEMORY:\n{state['memory']}"
            ),
        ]

        response: Stage1Response = model1.invoke(messages)
        print("[know_market_state] LLM RESPONSE:", response)

        db = SessionLocal()
        try:
            db.add(PricingAIStage1Log(
                id=str(uuid.uuid4()),
                variant_id=state["variant_id"],
                batch_id=state["batch_id"],
                metrics_snapshot_id=state["snapshot"]["metrics_snapshot_id"],
                market_state=response.market_state,
                raw_response=response.raw_response
            ))
            db.commit()
            print("[know_market_state] DB COMMIT SUCCESS")
        except Exception as e:
            print("[know_market_state] DB ERROR:", e)
            traceback.print_exc()
            db.rollback()
            raise
        finally:
            db.close()

        return {"market_state": response.market_state}
    except Exception as e:
        print("[know_market_state] ERROR:", e)
        traceback.print_exc()
        raise


def decide_pricing_strategy(state: PricingGraphState):
    print("\n[decide_pricing_strategy] START", state)
    try:
        messages = [
            SystemMessage(
                content="Decide RAISE, LOWER, or HOLD. Also provide aggressiveness (1–5) and confidence (0–1)."
            ),
            HumanMessage(
                content=f"MARKET_STATE:\n{state['market_state']}\n\nSNAPSHOT:\n{state['snapshot']}\n\nMEMORY:\n{state['memory']}"
            ),
        ]

        response: Stage2Response = model2.invoke(messages)
        print("[decide_pricing_strategy] LLM RESPONSE:", response)

        db = SessionLocal()
        try:
            stage2_log = PricingAIStage2Log(
                id=str(uuid.uuid4()),
                variant_id=state["variant_id"],
                batch_id=state["batch_id"],
                strategy=response.strategy,
                aggressiveness=response.aggressiveness,
                confidence=response.confidence,
                raw_response=response.raw_response
            )
            db.add(stage2_log)
            db.commit()
            print("[decide_pricing_strategy] DB COMMIT SUCCESS")

            return {
                "strategy": response.strategy,
                "aggressiveness": response.aggressiveness,
                "confidence": response.confidence,
                "stage2_log_id": stage2_log.id
            }

        except Exception as e:
            print("[decide_pricing_strategy] DB ERROR:", e)
            traceback.print_exc()
            db.rollback()
            raise
        finally:
            db.close()
    except Exception as e:
        print("[decide_pricing_strategy] ERROR:", e)
        traceback.print_exc()
        raise


def deterministic_pricing_engine(state: PricingGraphState):
    print("\n[deterministic_pricing_engine] START", state)
    try:
        snapshot = state["snapshot"]

        current_price = float(snapshot["current_price"])
        lower_limit = float(snapshot["lower_limit"])
        upper_limit = float(snapshot["upper_limit"])

        curve = {1: 0.01, 2: 0.025, 3: 0.045, 4: 0.07, 5: 0.10}
        percent = curve.get(state["aggressiveness"], 0.01)

        if state["strategy"] == "RAISE":
            new_price = current_price * (1 + percent)
        elif state["strategy"] == "LOWER":
            new_price = current_price * (1 - percent)
        else:
            new_price = current_price

        new_price = min(max(new_price, lower_limit), upper_limit)

        print("[deterministic_pricing_engine] NEW PRICE:", new_price)

        return {"proposed_price": round(new_price, 2)}
    except Exception as e:
        print("[deterministic_pricing_engine] ERROR:", e)
        traceback.print_exc()
        raise


def memory_guard_node(state: PricingGraphState):
    print("\n[memory_guard_node] START", state)

    try:
        memory = state.get("memory", {})
        now = datetime.now(timezone.utc)

        cooldown_until = memory.get("cooldown_until")
        strategy = state.get("strategy")

        # ---------------- COOLDOWN CHECK ----------------
        if cooldown_until and now < cooldown_until:
            print("[memory_guard_node] COOLDOWN ACTIVE")

            # Allow corrective lowering during cooldown
            if strategy == "LOWER":
                print("[memory_guard_node] Allowing LOWER during cooldown (correction)")
                return {"create_proposal": True}

            print("[memory_guard_node] Blocking strategy due to cooldown")
            return {"create_proposal": False}

        # ---------------- HOLD BLOCK ----------------
        if strategy == "HOLD":
            print("[memory_guard_node] STRATEGY HOLD")
            return {"create_proposal": False}

        print("[memory_guard_node] PROPOSAL ALLOWED")
        return {"create_proposal": True}

    except Exception as e:
        print("[memory_guard_node] ERROR:", e)
        traceback.print_exc()
        raise


def proposal_router(state: PricingGraphState):
    print("\n[proposal_router] START", state)
    if state.get("create_proposal"):
        print("[proposal_router] ROUTING TO proposal_node")
        return "proposal_node"
    print("[proposal_router] ROUTING TO END")
    return END


from langgraph.errors import GraphInterrupt

def proposal_node(state: PricingGraphState):
    print("\n[proposal_node] START", state)
    db = SessionLocal()

    try:
        try:
            existing = (
                db.query(PricingProposal)
                .filter(
                    PricingProposal.variant_id == state["variant_id"],
                    PricingProposal.status == ProposalStatus.PENDING
                )
                .first()
            )

            if existing:
                proposal = existing
                print("[proposal_node] EXISTING PENDING PROPOSAL:", proposal.id)
            else:
                proposal = PricingProposal(
                    id=str(uuid.uuid4()),
                    variant_id=state["variant_id"],
                    old_price=state["snapshot"]["current_price"],
                    proposed_price=state["proposed_price"],
                    batch_id=state["batch_id"],
                    status=ProposalStatus.PENDING,
                    metrics_snapshot_id=state["snapshot"]["metrics_snapshot_id"],
                    ai_decision_id=state["stage2_log_id"],
                    memory_snapshot=state["memory"]
                )

                db.add(proposal)
                db.commit()
                print("[proposal_node] PROPOSAL CREATED:", proposal.id)

            decision = interrupt({
                "proposal_id": proposal.id,
                "variant_id": state["variant_id"],
                "proposed_price": state["proposed_price"]
            })

            print("[proposal_node] INTERRUPT DECISION:", decision)

            return {
                "approval_decision": decision,
                "proposal_id": proposal.id
            }

        except GraphInterrupt:
            raise

        except Exception as e:
            print("[proposal_node] DB ERROR:", e)
            traceback.print_exc()
            db.rollback()
            raise

    finally:
        db.close()


def approval_router(state: PricingGraphState):
    print("\n[approval_router] START", state)
    if state["approval_decision"] == "approved":
        print("[approval_router] ROUTING TO apply_approval_node")
        return "apply_approval_node"
    print("[approval_router] ROUTING TO apply_rejection_node")
    return "apply_rejection_node"


def apply_rejection_node(state: PricingGraphState):
    print("\n[apply_rejection_node] START", state)
    try:
        db = SessionLocal()
        try:
            proposal = db.query(PricingProposal).filter_by(
                id=state["proposal_id"]
            ).first()

            if not proposal:
                print("[apply_rejection_node] PROPOSAL NOT FOUND")
                return {}

            proposal.status = ProposalStatus.REJECTED
            proposal.rejected_at = datetime.now(timezone.utc) 
            db.commit()
            print("[apply_rejection_node] REJECTION COMMITTED")

        except Exception as e:
            print("[apply_rejection_node] DB ERROR:", e)
            traceback.print_exc()
            db.rollback()
            raise
        finally:
            db.close()
    except Exception as e:
        print("[apply_rejection_node] ERROR:", e)
        traceback.print_exc()
        raise

    return {}


def apply_approval_node(state: PricingGraphState):
    print("\n[apply_approval_node] START", state)

    try:
        db = SessionLocal()

        try:
            proposal = db.query(PricingProposal).filter_by(
                id=state["proposal_id"]
            ).first()

            if not proposal:
                raise Exception("Proposal not found")

            print("[apply_approval_node] CALLING PRODUCT SERVICE")

            response = requests.post(
                "http://productservice:4006/internal/update_price",
                json={
                    "variant_id": proposal.variant_id,
                    "new_price": float(proposal.proposed_price)
                },
                headers={
                    "x-request-id": str(uuid.uuid4()),
                    "x-admin": "true"
                },
                timeout=20
            )

            print("[apply_approval_node] PRODUCT SERVICE STATUS:", response.status_code)

            if response.status_code != 200:
                raise Exception("Product service update failed")

            now = datetime.now(timezone.utc)

            # =========================
            # UPDATE PROPOSAL STATUS
            # =========================
            proposal.status = ProposalStatus.APPROVED
            proposal.approved_at = now

            # =========================
            # ADD PRICE HISTORY ENTRY
            # =========================
            db.add(PricingPriceHistory(
                id=str(uuid.uuid4()),
                variant_id=proposal.variant_id,
                old_price=proposal.old_price,
                new_price=proposal.proposed_price,
                change_reason="AI_APPROVED",
                batch_id=proposal.batch_id,
                approved_at=now
            ))

            # =========================
            # MEMORY UPDATE (WITH OSCILLATION TRACKING)
            # =========================
            memory = db.query(PricingMemory).filter_by(
                variant_id=proposal.variant_id
            ).first()

            cooldown_time = now + timedelta(hours=24)

            new_strategy = state.get("strategy")

            if not memory:
                print("[apply_approval_node] Creating new PricingMemory")

                memory = PricingMemory(
                    variant_id=proposal.variant_id,
                    last_strategy=new_strategy,
                    last_market_state=state.get("market_state"),
                    last_price=proposal.proposed_price,
                    last_price_change_at=now,
                    cooldown_until=cooldown_time,
                    oscillation_score=0,
                    stability_index=1.00
                )
                db.add(memory)

            else:
                print("[apply_approval_node] Updating existing PricingMemory")

                previous_strategy = memory.last_strategy

                # Track oscillation if strategy flips direction
                if previous_strategy and previous_strategy != new_strategy:
                    memory.oscillation_score += 1
                    print(
                        f"[apply_approval_node] Oscillation increased to {memory.oscillation_score}"
                    )

                memory.last_strategy = new_strategy
                memory.last_market_state = state.get("market_state")
                memory.last_price = proposal.proposed_price
                memory.last_price_change_at = now
                memory.cooldown_until = cooldown_time

            db.commit()
            print("[apply_approval_node] APPROVAL COMMITTED")

        except Exception as e:
            print("[apply_approval_node] DB ERROR:", e)
            traceback.print_exc()
            db.rollback()
            raise

        finally:
            db.close()

    except Exception as e:
        print("[apply_approval_node] ERROR:", e)
        traceback.print_exc()
        raise

    return {}


# ===========================
# GRAPH BUILD
# ===========================

print("\n[GRAPH_BUILD] INITIALIZING GRAPH")

try:
    graph = StateGraph(PricingGraphState)
    print("[GRAPH_BUILD] StateGraph created")

    graph.add_node("know_market_state", know_market_state)
    print("[GRAPH_BUILD] Node added: know_market_state")

    graph.add_node("decide_pricing_strategy", decide_pricing_strategy)
    print("[GRAPH_BUILD] Node added: decide_pricing_strategy")

    graph.add_node("deterministic_pricing_engine", deterministic_pricing_engine)
    print("[GRAPH_BUILD] Node added: deterministic_pricing_engine")

    graph.add_node("memory_guard_node", memory_guard_node)
    print("[GRAPH_BUILD] Node added: memory_guard_node")

    graph.add_node("proposal_node", proposal_node)
    print("[GRAPH_BUILD] Node added: proposal_node")

    graph.add_node("apply_approval_node", apply_approval_node)
    print("[GRAPH_BUILD] Node added: apply_approval_node")

    graph.add_node("apply_rejection_node", apply_rejection_node)
    print("[GRAPH_BUILD] Node added: apply_rejection_node")

    graph.add_edge(START, "know_market_state")
    print("[GRAPH_BUILD] Edge added: START -> know_market_state")

    graph.add_edge("know_market_state", "decide_pricing_strategy")
    print("[GRAPH_BUILD] Edge added: know_market_state -> decide_pricing_strategy")

    graph.add_edge("decide_pricing_strategy", "deterministic_pricing_engine")
    print("[GRAPH_BUILD] Edge added: decide_pricing_strategy -> deterministic_pricing_engine")

    graph.add_edge("deterministic_pricing_engine", "memory_guard_node")
    print("[GRAPH_BUILD] Edge added: deterministic_pricing_engine -> memory_guard_node")

    graph.add_conditional_edges("memory_guard_node", proposal_router)
    print("[GRAPH_BUILD] Conditional edge added: memory_guard_node")

    graph.add_conditional_edges("proposal_node", approval_router)
    print("[GRAPH_BUILD] Conditional edge added: proposal_node")

    graph.add_edge("apply_approval_node", END)
    print("[GRAPH_BUILD] Edge added: apply_approval_node -> END")

    graph.add_edge("apply_rejection_node", END)
    print("[GRAPH_BUILD] Edge added: apply_rejection_node -> END")

    print("[GRAPH_BUILD] GRAPH BUILD SUCCESS")

except Exception as e:
    print("[GRAPH_BUILD] ERROR DURING GRAPH BUILD:", e)
    import traceback
    traceback.print_exc()
    raise


# ===========================
# EXECUTION ENTRY
# ===========================

def run_pricing_flow(compiled_graph, variant_id: str, batch_id: str, snapshot: dict, memory: dict):
    print("\n[run_pricing_flow] START")
    print("[run_pricing_flow] variant_id:", variant_id)
    print("[run_pricing_flow] batch_id:", batch_id)
    print("[run_pricing_flow] snapshot:", snapshot)
    print("[run_pricing_flow] memory:", memory)

    try:
        thread_id = f"{batch_id}:{variant_id}"
        print("[run_pricing_flow] thread_id:", thread_id)

        initial_state = {
            "variant_id": variant_id,
            "batch_id": batch_id,
            "snapshot": snapshot,
            "memory": memory
        }

        print("[run_pricing_flow] invoking graph with initial_state")

        result = compiled_graph.invoke(
            initial_state,
            config={"configurable": {"thread_id": thread_id}}
        )

        print("[run_pricing_flow] GRAPH EXECUTION COMPLETE")
        print("[run_pricing_flow] RESULT:", result)

        return result

    except Exception as e:
        print("[run_pricing_flow] ERROR:", e)
        import traceback
        traceback.print_exc()
        raise