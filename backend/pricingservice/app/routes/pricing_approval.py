from fastapi import HTTPException, Request
from langgraph.types import Command

from app.db.session import SessionLocal
from app.db import models


def approve_proposal(proposal_id: str, request: Request):
    db = SessionLocal()
    try:
        proposal = (
            db.query(models.PricingProposal)
            .filter(models.PricingProposal.id == proposal_id)
            .first()
        )

        if not proposal:
            raise HTTPException(status_code=404, detail="Proposal not found")

        if proposal.status != models.ProposalStatus.PENDING:
            raise HTTPException(status_code=400, detail="Proposal already processed")

        thread_id = f"{proposal.batch_id}:{proposal.variant_id}"

        graph = request.app.state.graph

        graph.invoke(
            Command(resume="approved"),
            config={
                "configurable": {
                    "thread_id": thread_id
                }
            }
        )

        return {
            "proposal_id": proposal_id,
            "decision": "approved"
        }

    finally:
        db.close()


def reject_proposal(proposal_id: str, request: Request):
    db = SessionLocal()
    try:
        proposal = (
            db.query(models.PricingProposal)
            .filter(models.PricingProposal.id == proposal_id)
            .first()
        )

        if not proposal:
            raise HTTPException(status_code=404, detail="Proposal not found")

        if proposal.status != models.ProposalStatus.PENDING:
            raise HTTPException(status_code=400, detail="Proposal already processed")

        thread_id = f"{proposal.batch_id}:{proposal.variant_id}"

        graph = request.app.state.graph

        graph.invoke(
            Command(resume="rejected"),
            config={
                "configurable": {
                    "thread_id": thread_id
                }
            }
        )

        return {
            "proposal_id": proposal_id,
            "decision": "rejected"
        }

    finally:
        db.close()


def fetch_proposals(status: str | None = None):
    db = SessionLocal()
    try:
        query = db.query(models.PricingProposal)

        if status:
            try:
                status_enum = models.ProposalStatus(status)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid status")

            query = query.filter(models.PricingProposal.status == status_enum)

        proposals = query.order_by(models.PricingProposal.created_at.desc()).all()

        return [
            {
                "id": p.id,
                "variant_id": p.variant_id,
                "old_price": float(p.old_price),
                "proposed_price": float(p.proposed_price),
                "status": p.status.value,
                "created_at": p.created_at,
                "approved_at": p.approved_at,
                "rejected_at": p.rejected_at,
            }
            for p in proposals
        ]

    finally:
        db.close()
