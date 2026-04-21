"""Background ticks: contest lifecycle, training job completion (POC)."""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.constants import DEMO_POOL_RUN_MINUTES, MIN_OPEN_DEMO_CONTESTS
from app.database import SessionLocal
from app.models import Agent, AgentModel, Contest, TrainingJob
from app.contest_factory import ensure_open_demo_contests
from app.pool_service import settle_contest

log = logging.getLogger(__name__)


def _as_utc(dt: datetime) -> datetime:
    """DB may return naive timestamps; compare safely against aware `now`."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _tick_training(db: Session, now: datetime) -> None:
    jobs = db.query(TrainingJob).filter(TrainingJob.status == "queued").limit(20).all()
    for j in jobs:
        j.status = "running"
        j.started_at = now
        agent = db.get(Agent, j.agent_id)
        if not agent:
            j.status = "failed"
            j.finished_at = now
            continue
        max_v = (
            db.query(func.max(AgentModel.version)).filter(AgentModel.agent_id == agent.id).scalar()
        ) or 0
        model = AgentModel(
            agent_id=agent.id,
            version=max_v + 1,
            algo=j.algo,
            storage_uri=f"minio://checkpoints/agent-{agent.id}/v{max_v + 1}.pt",
            checksum_sha256="0" * 64,
            metrics={"mean_reward": 10.2, "steps": 50_000},
        )
        db.add(model)
        db.flush()
        j.model_id = model.id
        j.status = "succeeded"
        j.finished_at = now
        agent.training_level = min(agent.training_level + 1, 99)


def _tick_contests(db: Session, now: datetime) -> None:
    active = (
        db.query(Contest)
        .filter(Contest.status.in_(["open", "locked"]))
        .order_by(Contest.id)
        .all()
    )
    for c in active:
        if c.status == "open" and _as_utc(c.join_deadline) <= now:
            c.status = "locked"
    db.flush()
    for c in (
        db.query(Contest)
        .filter(Contest.status == "locked")
        .order_by(Contest.id)
        .all()
    ):
        if _as_utc(c.starts_at) <= now:
            c.status = "running"
            if c.ends_at is None:
                c.ends_at = c.starts_at + timedelta(minutes=DEMO_POOL_RUN_MINUTES)
    db.flush()
    for c in (
        db.query(Contest)
        .filter(Contest.status == "running")
        .order_by(Contest.id)
        .all()
    ):
        end_at = _as_utc(c.ends_at) if c.ends_at else _as_utc(c.starts_at) + timedelta(minutes=DEMO_POOL_RUN_MINUTES)
        if end_at <= now:
            try:
                settle_contest(db, c)
            except Exception:
                log.exception("settle_contest failed contest_id=%s", c.id)


def run_scheduler_tick(db: Session) -> None:
    """Advance contests and training. Call `ensure_open_demo_contests` separately if you commit in phases."""
    now = datetime.now(timezone.utc)
    _tick_contests(db, now)
    _tick_training(db, now)


async def scheduler_loop() -> None:
    """Poll frequently so join deadlines / start times hit on time (pool windows are minutes-scale; see `constants.DEMO_POOL_*`)."""
    first = True
    while True:
        if not first:
            await asyncio.sleep(5)
        first = False
        # Top up open pools in its own commit so a later settle error does not roll back new contests.
        db_top = SessionLocal()
        try:
            ensure_open_demo_contests(db_top, minimum=MIN_OPEN_DEMO_CONTESTS)
            db_top.commit()
        except Exception:
            log.exception("ensure_open_demo_contests failed")
            db_top.rollback()
        finally:
            db_top.close()
        db = SessionLocal()
        try:
            run_scheduler_tick(db)
            db.commit()
        except Exception:
            log.exception("scheduler tick failed")
            db.rollback()
        finally:
            db.close()
