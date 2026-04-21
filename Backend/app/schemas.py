from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    display_name: str | None = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshIn(BaseModel):
    refresh_token: str


class LogoutIn(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: int
    email: str
    display_name: str | None
    role: str
    balance_cents: int

    class Config:
        from_attributes = True


class AgentOut(BaseModel):
    id: int
    name: str
    sku_tier: str
    elo: int
    mmr: float
    training_level: int
    latest_model_id: int | None = None

    class Config:
        from_attributes = True


class BuyAgentIn(BaseModel):
    sku: str = Field(pattern="^(starter|pro|elite)$")
    name: str = Field(min_length=1, max_length=128)


class TrainAgentIn(BaseModel):
    game: str
    algo: str = "PPO"
    hyperparams: dict[str, Any] | None = None


class EnterPoolIn(BaseModel):
    contest_id: int
    model_id: int


class ContestOut(BaseModel):
    id: int
    pool_tier: str
    game: str
    entry_fee_cents: int
    prize_pool_cents: int
    max_slots: int
    join_deadline: datetime
    starts_at: datetime
    status: str
    filled_slots: int = 0

    class Config:
        from_attributes = True


class PoolReportOut(BaseModel):
    contest_id: int
    game: str
    pool_tier: str
    config: dict[str, Any]
    anti_overfit_seed_hex: str
    winner_agent_id: int | None
    winner_reason: str | None
    results: list[dict[str, Any]]


class WalletOut(BaseModel):
    balance_cents: int
    currency: str = "credits"


class TxOut(BaseModel):
    id: int
    type: str
    amount_cents: int
    ref_type: str | None
    ref_id: int | None
    created_at: datetime

    class Config:
        from_attributes = True


class CreatePoolIn(BaseModel):
    pool_tier: str
    game: str
    entry_fee_cents: int
    prize_pool_cents: int
    max_slots: int
    join_window_seconds: int = 120
    run_window_seconds: int = 60


class HealthOut(BaseModel):
    api: str
    database: str
    redis: str
    contests_open: int
    training_queued: int
