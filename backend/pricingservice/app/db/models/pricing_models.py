from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    ForeignKey,
    Enum,
    Text,
    Numeric
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.db.base import Base
import enum


# ---------------- ENUMS ---------------- #

class ProposalStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class StrategyType(str, enum.Enum):
    RAISE = "RAISE"
    LOWER = "LOWER"
    HOLD = "HOLD"


# ---------------- CORE MEMORY TABLE ---------------- #

class PricingMemory(Base):
    __tablename__ = "pricing_memory"

    variant_id = Column(String, primary_key=True, index=True)

    last_strategy = Column(Enum(StrategyType), nullable=True)
    last_market_state = Column(String, nullable=True)

    last_price = Column(Numeric(12, 2), nullable=True)
    last_price_change_at = Column(DateTime(timezone=True), nullable=True)

    cooldown_until = Column(DateTime(timezone=True), nullable=True)

    oscillation_score = Column(Integer, default=0)
    stability_index = Column(Numeric(5, 2), default=1.00)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )


# ---------------- SCHEDULER BATCH ---------------- #

class PricingEvaluationBatch(Base):
    __tablename__ = "pricing_evaluation_batch"

    id = Column(String, primary_key=True, index=True)

    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    total_variants = Column(Integer, default=0)
    processed_variants = Column(Integer, default=0)
    proposals_created = Column(Integer, default=0)

    status = Column(String, default="RUNNING")


# ---------------- METRICS SNAPSHOT ---------------- #

class PricingMetricsSnapshot(Base):
    __tablename__ = "pricing_metrics_snapshot"

    id = Column(String, primary_key=True, index=True)

    variant_id = Column(String, index=True)
    batch_id = Column(String, ForeignKey("pricing_evaluation_batch.id"))

    metrics_json = Column(JSONB, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ---------------- AI STAGE 1 LOG ---------------- #

class PricingAIStage1Log(Base):
    __tablename__ = "pricing_ai_stage1_log"

    id = Column(String, primary_key=True, index=True)

    variant_id = Column(String, index=True)
    batch_id = Column(String, ForeignKey("pricing_evaluation_batch.id"))
    metrics_snapshot_id = Column(String, ForeignKey("pricing_metrics_snapshot.id"))

    market_state = Column(String, nullable=False)
    raw_response = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ---------------- AI STAGE 2 LOG ---------------- #

class PricingAIStage2Log(Base):
    __tablename__ = "pricing_ai_stage2_log"

    id = Column(String, primary_key=True, index=True)

    variant_id = Column(String, index=True)
    batch_id = Column(String, ForeignKey("pricing_evaluation_batch.id"))
    stage1_log_id = Column(String, ForeignKey("pricing_ai_stage1_log.id"))

    strategy = Column(Enum(StrategyType), nullable=False)
    aggressiveness = Column(Integer, nullable=True)
    confidence = Column(Numeric(4, 2), nullable=True)

    raw_response = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ---------------- PROPOSAL TABLE ---------------- #

class PricingProposal(Base):
    __tablename__ = "pricing_proposal"

    id = Column(String, primary_key=True, index=True)

    variant_id = Column(String, index=True)

    old_price = Column(Numeric(12, 2), nullable=False)
    proposed_price = Column(Numeric(12, 2), nullable=False)

    batch_id = Column(String, ForeignKey("pricing_evaluation_batch.id"))


    status = Column(Enum(ProposalStatus), default=ProposalStatus.PENDING)

    metrics_snapshot_id = Column(String, ForeignKey("pricing_metrics_snapshot.id"))
    ai_decision_id = Column(String, ForeignKey("pricing_ai_stage2_log.id"))

    memory_snapshot = Column(JSONB, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejected_at = Column(DateTime(timezone=True), nullable=True)


# ---------------- PRICE HISTORY ---------------- #

class PricingPriceHistory(Base):
    __tablename__ = "pricing_price_history"

    id = Column(String, primary_key=True, index=True)

    variant_id = Column(String, index=True)

    old_price = Column(Numeric(12, 2), nullable=False)
    new_price = Column(Numeric(12, 2), nullable=False)

    change_reason = Column(String, nullable=True)
    batch_id = Column(String, ForeignKey("pricing_evaluation_batch.id"))

    approved_at = Column(DateTime(timezone=True), nullable=False)
