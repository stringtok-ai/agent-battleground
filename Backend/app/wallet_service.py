from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import User, WalletTransaction


def adjust_balance(
    db: Session,
    user_id: int,
    delta_cents: int,
    tx_type: str,
    *,
    ref_type: str | None = None,
    ref_id: int | None = None,
    idempotency_key: str | None = None,
    meta: dict | None = None,
) -> WalletTransaction:
    user = db.get(User, user_id)
    if not user:
        raise ValueError("user not found")
    if idempotency_key:
        existing = (
            db.query(WalletTransaction)
            .filter(WalletTransaction.idempotency_key == idempotency_key)
            .one_or_none()
        )
        if existing:
            return existing
    new_balance = user.balance_cents + delta_cents
    if new_balance < 0:
        raise ValueError("insufficient balance")
    user.balance_cents = new_balance
    tx = WalletTransaction(
        user_id=user_id,
        type=tx_type,
        amount_cents=delta_cents,
        ref_type=ref_type,
        ref_id=ref_id,
        idempotency_key=idempotency_key,
        meta=meta,
    )
    db.add(tx)
    db.flush()
    return tx
