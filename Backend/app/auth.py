import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt

from app.config import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("ascii")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("ascii"))
    except ValueError:
        return False


def _exp_ts(**kwargs: float | int) -> int:
    return int((datetime.now(timezone.utc) + timedelta(**kwargs)).timestamp())


def create_access_token(sub: str) -> str:
    payload = {
        "sub": sub,
        "exp": _exp_ts(minutes=settings.access_token_expire_minutes),
        "typ": "access",
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_refresh_jwt(sub: str) -> tuple[str, str]:
    jti = secrets.token_urlsafe(32)
    payload = {
        "sub": sub,
        "exp": _exp_ts(days=settings.refresh_token_expire_days),
        "typ": "refresh",
        "jti": jti,
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return token, jti


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
