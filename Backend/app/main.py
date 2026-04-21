from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from app.contest_factory import ensure_open_demo_contests
from app.database import Base, SessionLocal, engine
from app.routers import admin, agents, auth, contests, health, wallet
from app.scheduler import run_scheduler_tick, scheduler_loop
from app.seed import maybe_seed

log = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        maybe_seed(db)
        ensure_open_demo_contests(db)
        run_scheduler_tick(db)
        db.commit()
    except Exception:
        log.exception("seed failed")
        db.rollback()
        raise
    finally:
        db.close()
    task = asyncio.create_task(scheduler_loop())
    try:
        yield
    finally:
        task.cancel()
        with suppress(asyncio.CancelledError):
            await task


app = FastAPI(title="Agent Battleground API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(agents.router, prefix="/agents", tags=["agents"])
app.include_router(contests.router, prefix="/contests", tags=["contests"])
app.include_router(wallet.router, prefix="/wallet", tags=["wallet"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])


@app.websocket("/ws/live")
async def ws_live(websocket: WebSocket) -> None:
    await websocket.accept()
    await websocket.send_json(
        {"channel": "contests", "message": "POC stub; use HTTP polling or Redis pub/sub in production."}
    )
    await websocket.close()
