"""Create or reset the high-balance demo investor account (works on already-seeded DBs).

Run from the Backend directory:
  python scripts/upsert_demo_investor.py
"""
from __future__ import annotations

import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from app.auth import hash_password  # noqa: E402
from app.database import SessionLocal  # noqa: E402
from app.models import User  # noqa: E402

DEMO_EMAIL = "demo@agentbattleground.demo"
DEMO_PASSWORD = "DemoCredits123!"
DEMO_BALANCE_CENTS = 5_000_000


def main() -> None:
    db = SessionLocal()
    try:
        u = db.query(User).filter(User.email == DEMO_EMAIL).one_or_none()
        if u:
            u.password_hash = hash_password(DEMO_PASSWORD)
            u.balance_cents = DEMO_BALANCE_CENTS
            u.display_name = "Demo Investor"
            u.role = "user"
        else:
            db.add(
                User(
                    email=DEMO_EMAIL,
                    password_hash=hash_password(DEMO_PASSWORD),
                    display_name="Demo Investor",
                    role="user",
                    balance_cents=DEMO_BALANCE_CENTS,
                )
            )
        db.commit()
        print(f"Ready: {DEMO_EMAIL}")
        print(f"Password: {DEMO_PASSWORD}")
        print(f"Balance: {DEMO_BALANCE_CENTS:,} credits (wallet field balance_cents)")
    finally:
        db.close()


if __name__ == "__main__":
    main()
