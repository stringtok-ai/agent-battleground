from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.contest_factory import ensure_open_demo_contests
from app.database import get_db
from app.deps import get_current_user
from app.models import Agent, AgentModel, Contest, ContestEntry, User
from app.pool_service import contest_filled_slots
from app.schemas import ContestOut, EnterPoolIn
from app.wallet_service import adjust_balance

router = APIRouter()


def _contest_out(db: Session, c: Contest) -> ContestOut:
    filled = contest_filled_slots(db, c.id)
    return ContestOut(
        id=c.id,
        pool_tier=c.pool_tier,
        game=c.game,
        entry_fee_cents=int(c.entry_fee_cents),
        prize_pool_cents=int(c.prize_pool_cents),
        max_slots=c.max_slots,
        join_deadline=c.join_deadline,
        starts_at=c.starts_at,
        status=c.status,
        filled_slots=filled,
    )


@router.get("", response_model=list[ContestOut])
def list_contests(
    status: str | None = None,
    db: Session = Depends(get_db),
) -> list[ContestOut]:
    # Self-heal: if the scheduler has not run yet (or DB was empty), top up open demo pools.
    ensure_open_demo_contests(db)
    db.commit()
    q = db.query(Contest).order_by(Contest.starts_at)
    if status:
        q = q.filter(Contest.status == status)
    return [_contest_out(db, c) for c in q.all()]


@router.get("/{contest_id}", response_model=ContestOut)
def get_contest(contest_id: int, db: Session = Depends(get_db)) -> ContestOut:
    c = db.get(Contest, contest_id)
    if not c:
        raise HTTPException(404, "Contest not found")
    return _contest_out(db, c)


@router.post("/{contest_id}/enter", status_code=201)
def enter_contest(
    contest_id: int,
    body: EnterPoolIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    if body.contest_id != contest_id:
        raise HTTPException(400, "contest_id mismatch")
    c = db.get(Contest, contest_id)
    if not c or c.status != "open":
        raise HTTPException(400, "Contest not open for entry")

    def _utc(dt: datetime) -> datetime:
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)

    if datetime.now(timezone.utc) > _utc(c.join_deadline):
        raise HTTPException(400, "Join deadline passed")

    if contest_filled_slots(db, c.id) >= c.max_slots:
        raise HTTPException(400, "Contest full")

    model = db.get(AgentModel, body.model_id)
    if not model:
        raise HTTPException(404, "Model not found")
    agent = db.get(Agent, model.agent_id)
    if not agent or agent.owner_id != user.id:
        raise HTTPException(403, "Model does not belong to you")

    fee = int(c.entry_fee_cents)
    try:
        adjust_balance(
            db,
            user.id,
            -fee,
            "contest_entry",
            ref_type="contest",
            ref_id=c.id,
            idempotency_key=f"enter:{c.id}:{user.id}",
        )
    except ValueError as e:
        raise HTTPException(400, str(e)) from e

    entry = ContestEntry(
        contest_id=c.id,
        user_id=user.id,
        agent_id=agent.id,
        model_id=model.id,
    )
    db.add(entry)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(400, "Already entered or duplicate agent") from None
    return {"ok": True, "entry_id": entry.id}
