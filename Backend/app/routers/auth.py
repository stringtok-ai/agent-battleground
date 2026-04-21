from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import (
    create_access_token,
    create_refresh_jwt,
    decode_token,
    hash_password,
    verify_password,
)
from app.database import get_db
from app.deps import get_current_user
from app.models import RefreshToken, User
from app.schemas import LoginIn, LogoutIn, RefreshIn, RegisterIn, TokenOut, UserOut

router = APIRouter()


def _utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


@router.post("/register", response_model=TokenOut)
def register(body: RegisterIn, db: Session = Depends(get_db)) -> TokenOut:
    exists = db.query(User).filter(User.email == body.email).one_or_none()
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=str(body.email),
        password_hash=hash_password(body.password),
        display_name=body.display_name,
        role="user",
    )
    db.add(user)
    db.flush()
    access = create_access_token(str(user.id))
    refresh, jti = create_refresh_jwt(str(user.id))
    exp = datetime.fromtimestamp(decode_token(refresh)["exp"], tz=timezone.utc)
    db.add(RefreshToken(user_id=user.id, token_hash=jti, expires_at=exp, revoked=False))
    db.commit()
    return TokenOut(access_token=access, refresh_token=refresh)


@router.post("/login", response_model=TokenOut)
def login(body: LoginIn, db: Session = Depends(get_db)) -> TokenOut:
    user = db.query(User).filter(User.email == str(body.email)).one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access = create_access_token(str(user.id))
    refresh, jti = create_refresh_jwt(str(user.id))
    exp = datetime.fromtimestamp(decode_token(refresh)["exp"], tz=timezone.utc)
    db.add(RefreshToken(user_id=user.id, token_hash=jti, expires_at=exp, revoked=False))
    db.commit()
    return TokenOut(access_token=access, refresh_token=refresh)


@router.post("/refresh", response_model=TokenOut)
def refresh_token(body: RefreshIn, db: Session = Depends(get_db)) -> TokenOut:
    try:
        payload = decode_token(body.refresh_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    if payload.get("typ") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    jti = payload.get("jti")
    sub = payload.get("sub")
    if not jti or not sub:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    row = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == jti, RefreshToken.revoked.is_(False))
        .one_or_none()
    )
    if not row:
        raise HTTPException(status_code=401, detail="Refresh token revoked or unknown")
    if _utc(row.expires_at) < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Refresh token expired")
    access = create_access_token(str(sub))
    new_refresh, new_jti = create_refresh_jwt(str(sub))
    row.revoked = True
    exp = datetime.fromtimestamp(decode_token(new_refresh)["exp"], tz=timezone.utc)
    db.add(RefreshToken(user_id=row.user_id, token_hash=new_jti, expires_at=exp, revoked=False))
    db.commit()
    return TokenOut(access_token=access, refresh_token=new_refresh)


@router.post("/logout", status_code=204)
def logout(body: LogoutIn, db: Session = Depends(get_db)) -> None:
    try:
        payload = decode_token(body.refresh_token)
    except Exception:
        return None
    jti = payload.get("jti")
    if not jti:
        return None
    row = db.query(RefreshToken).filter(RefreshToken.token_hash == jti).one_or_none()
    if row:
        row.revoked = True
        db.commit()
    return None


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> User:
    return user
