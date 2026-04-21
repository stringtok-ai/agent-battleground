from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_admin
from app.constants import MIN_OPEN_DEMO_CONTESTS
from app.contest_factory import ensure_open_demo_contests
from app.models import Contest, User
from app.parameter_engine import build_pool_config, generate_anti_overfit_seed
from app.schemas import CreatePoolIn, PoolReportOut
from app.scheduler import run_scheduler_tick

router = APIRouter()


@router.post("/pools", status_code=201)
def create_pool(
    body: CreatePoolIn,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    anti = generate_anti_overfit_seed()
    now = datetime.now(timezone.utc)
    c = Contest(
        pool_tier=body.pool_tier,
        game=body.game,
        config_params={},
        anti_overfit_seed_hex=anti,
        entry_fee_cents=body.entry_fee_cents,
        prize_pool_cents=body.prize_pool_cents,
        max_slots=body.max_slots,
        join_deadline=now + timedelta(seconds=body.join_window_seconds),
        starts_at=now + timedelta(seconds=body.join_window_seconds),
        ends_at=now + timedelta(seconds=body.join_window_seconds + body.run_window_seconds),
        status="open",
        prize_split={"winner_pct": 80},
    )
    db.add(c)
    db.flush()
    c.config_params = build_pool_config(body.pool_tier, body.game, anti, c.id)
    db.commit()
    db.refresh(c)
    return {"contest_id": c.id}


@router.get("/contests/{contest_id}/report", response_model=PoolReportOut)
def pool_report(
    contest_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> PoolReportOut:
    c = db.get(Contest, contest_id)
    if not c:
        raise HTTPException(404, "Contest not found")
    report = c.pool_config_report or {}
    return PoolReportOut(
        contest_id=c.id,
        game=c.game,
        pool_tier=c.pool_tier,
        config=dict(c.config_params),
        anti_overfit_seed_hex=c.anti_overfit_seed_hex,
        winner_agent_id=c.winner_agent_id,
        winner_reason=report.get("winner_reason"),
        results=list(report.get("results", [])),
    )


@router.post("/scheduler/tick")
def force_tick(_: User = Depends(require_admin), db: Session = Depends(get_db)) -> dict:
    ensure_open_demo_contests(db, minimum=MIN_OPEN_DEMO_CONTESTS)
    run_scheduler_tick(db)
    db.commit()
    return {"ok": True}
