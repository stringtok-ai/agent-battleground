from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.constants import DEMO_CLAIM_CREDITS_CENTS
from app.database import get_db
from app.deps import get_current_user
from app.models import User, WalletTransaction
from app.schemas import TxOut, WalletOut
from app.wallet_service import adjust_balance

router = APIRouter()


@router.get("/balance", response_model=WalletOut)
def balance(user: User = Depends(get_current_user)) -> WalletOut:
    return WalletOut(balance_cents=int(user.balance_cents))


@router.get("/transactions", response_model=list[TxOut])
def transactions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50,
) -> list[WalletTransaction]:
    return (
        db.query(WalletTransaction)
        .filter(WalletTransaction.user_id == user.id)
        .order_by(WalletTransaction.id.desc())
        .limit(min(limit, 200))
        .all()
    )


@router.post("/claim-demo", response_model=WalletOut)
def claim_demo_credits(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> WalletOut:
    """Grant a fixed demo credit bundle (investor / local testing)."""
    adjust_balance(
        db,
        user.id,
        DEMO_CLAIM_CREDITS_CENTS,
        "demo_grant",
        meta={"reason": "wallet_claim_demo"},
    )
    db.commit()
    db.refresh(user)
    return WalletOut(balance_cents=int(user.balance_cents))
