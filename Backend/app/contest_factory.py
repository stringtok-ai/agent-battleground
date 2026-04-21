"""Create demo contests; used by seed and scheduler."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.constants import DEMO_POOL_JOIN_MINUTES, DEMO_POOL_RUN_MINUTES, DEMO_POOL_START_MINUTES, MIN_OPEN_DEMO_CONTESTS
from app.models import Contest
from app.parameter_engine import build_pool_config, generate_anti_overfit_seed

DEMO_TIERS_GAMES: tuple[tuple[str, str], ...] = (
    ("micro", "gridworld"),
    ("standard", "pushblock"),
    ("high", "walljump"),
    ("standard", "soccertwos"),
    ("high", "strikersvsgoalie"),
    ("micro", "foodcollector"),
    ("high", "match3"),
    ("standard", "walker"),
    ("high", "crawler"),
    ("standard", "worm"),
    ("high", "pyramids"),
    ("micro", "sorter"),
    ("high", "cooperativepushblock"),
)


def spawn_demo_contest(db: Session, tier: str, game: str, *, ordinal: int = 0) -> Contest:
    now = datetime.now(timezone.utc)
    i = ordinal % 3
    anti = generate_anti_overfit_seed()
    c = Contest(
        pool_tier=tier,
        game=game,
        config_params={},
        anti_overfit_seed_hex=anti,
        entry_fee_cents=100 * (i + 1),
        prize_pool_cents=10_000 * (i + 1),
        max_slots=8 + i * 2,
        join_deadline=now + timedelta(minutes=DEMO_POOL_JOIN_MINUTES),
        starts_at=now + timedelta(minutes=DEMO_POOL_START_MINUTES),
        ends_at=now + timedelta(minutes=DEMO_POOL_START_MINUTES + DEMO_POOL_RUN_MINUTES),
        status="open",
        prize_split={"winner_pct": 80, "runner_up_pct": 12},
    )
    db.add(c)
    db.flush()
    c.config_params = build_pool_config(tier, game, anti, c.id)
    return c


def ensure_open_demo_contests(db: Session, minimum: int | None = None) -> None:
    """If fewer than `minimum` open contests exist, create more (keeps the hub playable)."""
    if minimum is None:
        minimum = MIN_OPEN_DEMO_CONTESTS
    open_n = int(db.query(func.count(Contest.id)).filter(Contest.status == "open").scalar() or 0)
    need = max(0, minimum - open_n)
    if need == 0:
        return
    base = int(db.query(func.max(Contest.id)).scalar() or 0)
    for j in range(need):
        idx = (base + j) % len(DEMO_TIERS_GAMES)  # cycles all demo games for variety
        tier, game = DEMO_TIERS_GAMES[idx]
        spawn_demo_contest(db, tier, game, ordinal=base + j)
