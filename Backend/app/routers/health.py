import redis
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import Contest, TrainingJob
from app.schemas import HealthOut

router = APIRouter()


@router.get("/health", response_model=HealthOut)
def health(db: Session = Depends(get_db)) -> HealthOut:
    settings = get_settings()
    db_ok = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_ok = "error"
    redis_ok = "ok"
    try:
        r = redis.from_url(settings.redis_url)
        r.ping()
    except Exception:
        redis_ok = "error"
    open_n = db.query(Contest).filter(Contest.status == "open").count()
    q_jobs = db.query(TrainingJob).filter(TrainingJob.status == "queued").count()
    return HealthOut(
        api="ok",
        database=db_ok,
        redis=redis_ok,
        contests_open=open_n,
        training_queued=q_jobs,
    )
