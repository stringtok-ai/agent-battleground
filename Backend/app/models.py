from __future__ import annotations

import enum
from datetime import datetime
from typing import Any

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"
    demo = "demo"


class ContestStatus(str, enum.Enum):
    open = "open"
    locked = "locked"
    running = "running"
    settled = "settled"
    cancelled = "cancelled"


class TrainingJobStatus(str, enum.Enum):
    queued = "queued"
    running = "running"
    succeeded = "succeeded"
    failed = "failed"


class VpsStatus(str, enum.Enum):
    provisioning = "provisioning"
    ready = "ready"
    draining = "draining"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    display_name: Mapped[str | None] = mapped_column(String(128))
    role: Mapped[str] = mapped_column(String(32), default=UserRole.user.value, nullable=False)
    balance_cents: Mapped[int] = mapped_column(BigInteger, default=500_000, nullable=False)  # demo credits
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    agents: Mapped[list["Agent"]] = relationship(back_populates="owner")
    entries: Mapped[list["ContestEntry"]] = relationship(back_populates="user")


class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    sku_tier: Mapped[str] = mapped_column(String(32), nullable=False)
    elo: Mapped[int] = mapped_column(Integer, default=1200)
    mmr: Mapped[float] = mapped_column(Float, default=1500.0)
    adaptability: Mapped[float | None] = mapped_column(Float)
    consistency: Mapped[float | None] = mapped_column(Float)
    training_level: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    owner: Mapped["User"] = relationship(back_populates="agents")
    models: Mapped[list["AgentModel"]] = relationship(back_populates="agent")
    vps: Mapped["VpsNode | None"] = relationship(back_populates="agent", uselist=False)


class AgentModel(Base):
    __tablename__ = "agent_models"
    __table_args__ = (UniqueConstraint("agent_id", "version", name="uq_agent_model_version"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    agent_id: Mapped[int] = mapped_column(ForeignKey("agents.id"), nullable=False, index=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    algo: Mapped[str] = mapped_column(String(32), nullable=False)
    storage_uri: Mapped[str] = mapped_column(Text, nullable=False)
    checksum_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    metrics: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    agent: Mapped["Agent"] = relationship(back_populates="models")


class VpsNode(Base):
    __tablename__ = "vps_nodes"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    agent_id: Mapped[int] = mapped_column(ForeignKey("agents.id"), unique=True, nullable=False)
    plan: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default=VpsStatus.ready.value, nullable=False)
    provider_ref: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    agent: Mapped["Agent"] = relationship(back_populates="vps")


class TrainingJob(Base):
    __tablename__ = "training_jobs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    agent_id: Mapped[int] = mapped_column(ForeignKey("agents.id"), nullable=False, index=True)
    model_id: Mapped[int | None] = mapped_column(ForeignKey("agent_models.id"))
    env_game: Mapped[str] = mapped_column(String(64), nullable=False)
    algo: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default=TrainingJobStatus.queued.value)
    hyperparams: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    reward_curve_uri: Mapped[str | None] = mapped_column(Text)
    worker_id: Mapped[str | None] = mapped_column(String(64))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Contest(Base):
    __tablename__ = "contests"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    pool_tier: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    game: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    config_params: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    anti_overfit_seed_hex: Mapped[str] = mapped_column(String(64), nullable=False)
    param_schema_version: Mapped[int] = mapped_column(Integer, default=1)
    entry_fee_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)
    prize_pool_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)
    max_slots: Mapped[int] = mapped_column(Integer, nullable=False)
    join_deadline: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(32), default=ContestStatus.open.value, index=True)
    prize_split: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    winner_agent_id: Mapped[int | None] = mapped_column(ForeignKey("agents.id"))
    pool_config_report: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    entries: Mapped[list["ContestEntry"]] = relationship(back_populates="contest")
    results: Mapped[list["MatchResult"]] = relationship(back_populates="contest")


class ContestEntry(Base):
    __tablename__ = "contest_entries"
    __table_args__ = (
        UniqueConstraint("contest_id", "user_id", name="uq_contest_user"),
        UniqueConstraint("contest_id", "agent_id", name="uq_contest_agent"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    contest_id: Mapped[int] = mapped_column(ForeignKey("contests.id"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    agent_id: Mapped[int] = mapped_column(ForeignKey("agents.id"), nullable=False)
    model_id: Mapped[int] = mapped_column(ForeignKey("agent_models.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="confirmed")
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    contest: Mapped["Contest"] = relationship(back_populates="entries")
    user: Mapped["User"] = relationship(back_populates="entries")


class MatchResult(Base):
    __tablename__ = "match_results"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    contest_id: Mapped[int] = mapped_column(ForeignKey("contests.id"), nullable=False, index=True)
    agent_id: Mapped[int] = mapped_column(ForeignKey("agents.id"), nullable=False)
    model_id: Mapped[int] = mapped_column(ForeignKey("agent_models.id"), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    metrics: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    rank: Mapped[int | None] = mapped_column(Integer)
    replay_uri: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    contest: Mapped["Contest"] = relationship(back_populates="results")


class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(64), nullable=False)
    amount_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="credits")
    ref_type: Mapped[str | None] = mapped_column(String(64))
    ref_id: Mapped[int | None] = mapped_column(BigInteger)
    idempotency_key: Mapped[str | None] = mapped_column(String(128), unique=True)
    meta: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    token_hash: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    actor_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(128), nullable=False)
    entity: Mapped[str] = mapped_column(String(64), nullable=False)
    entity_id: Mapped[int | None] = mapped_column(BigInteger)
    diff: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
