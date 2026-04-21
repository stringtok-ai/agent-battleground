"""Idempotent demo seed (fast vs full)."""
from __future__ import annotations

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import hash_password
from app.config import get_settings
from app.constants import DEFAULT_DEMO_BALANCE_CENTS
from app.models import Agent, AgentModel, User
from app.contest_factory import DEMO_TIERS_GAMES, spawn_demo_contest


def maybe_seed(db: Session) -> None:
    settings = get_settings()
    n_users = db.query(func.count(User.id)).scalar() or 0
    if n_users > 0:
        return

    admin = User(
        email="admin@battleground.demo",
        password_hash=hash_password("Admin12345!"),
        display_name="Admin",
        role="admin",
        balance_cents=1_000_000,
    )
    db.add(admin)
    db.flush()

    demo_investor = User(
        email="demo@agentbattleground.demo",
        password_hash=hash_password("DemoCredits123!"),
        display_name="Demo Investor",
        role="user",
        balance_cents=5_000_000,
    )
    db.add(demo_investor)

    count = 5 if settings.seed_mode != "full" else 50
    users: list[User] = [admin, demo_investor]
    for i in range(count):
        u = User(
            email=f"player{i}@battleground.demo",
            password_hash=hash_password("Player12345!"),
            display_name=f"Player {i}",
            role="user",
            balance_cents=DEFAULT_DEMO_BALANCE_CENTS,
        )
        db.add(u)
        users.append(u)
    db.flush()

    agents: list[Agent] = []
    candidates = [u for u in users if u.id != admin.id][:10]
    for idx, u in enumerate(candidates):
        tier = ["starter", "pro", "elite"][idx % 3]
        a = Agent(
            owner_id=u.id,
            name=f"Agent-{tier}-{idx}",
            sku_tier=tier,
            elo=1100 + (idx * 17) % 400,
            mmr=1400.0 + (idx * 11) % 200,
            adaptability=0.5 + (idx % 10) / 20,
            consistency=0.55 + (idx % 8) / 20,
        )
        db.add(a)
        agents.append(a)
    db.flush()

    for a in agents:
        m = AgentModel(
            agent_id=a.id,
            version=1,
            algo="PPO",
            storage_uri=f"minio://models/agent-{a.id}/v1.pt",
            checksum_sha256="f" * 64,
            metrics={"mean_reward": 8.5},
        )
        db.add(m)

    db.flush()

    for i, (tier, game) in enumerate(DEMO_TIERS_GAMES):
        spawn_demo_contest(db, tier, game, ordinal=i)
