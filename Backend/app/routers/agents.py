from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.constants import SKU_PRICES_CENTS
from app.database import get_db
from app.deps import get_current_user
from app.models import Agent, AgentModel, TrainingJob, User
from app.schemas import AgentOut, BuyAgentIn, TrainAgentIn
from app.wallet_service import adjust_balance

router = APIRouter()


def _agent_out(db: Session, agent: Agent) -> AgentOut:
    latest = (
        db.query(AgentModel)
        .filter(AgentModel.agent_id == agent.id)
        .order_by(AgentModel.version.desc())
        .first()
    )
    return AgentOut(
        id=agent.id,
        name=agent.name,
        sku_tier=agent.sku_tier,
        elo=agent.elo,
        mmr=agent.mmr,
        training_level=agent.training_level,
        latest_model_id=latest.id if latest else None,
    )


@router.get("", response_model=list[AgentOut])
def list_agents(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[AgentOut]:
    agents = db.query(Agent).filter(Agent.owner_id == user.id).order_by(Agent.id).all()
    return [_agent_out(db, a) for a in agents]


@router.post("/buy", response_model=AgentOut)
def buy_agent(body: BuyAgentIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> AgentOut:
    price = SKU_PRICES_CENTS.get(body.sku)
    if price is None:
        raise HTTPException(400, "Unknown SKU")
    try:
        adjust_balance(
            db,
            user.id,
            -price,
            "buy_agent",
            meta={"sku": body.sku, "name": body.name},
        )
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    agent = Agent(
        owner_id=user.id,
        name=body.name,
        sku_tier=body.sku,
    )
    db.add(agent)
    db.flush()
    model = AgentModel(
        agent_id=agent.id,
        version=1,
        algo="PPO",
        storage_uri=f"minio://models/agent-{agent.id}/v1.pt",
        checksum_sha256="0" * 64,
        metrics={},
    )
    db.add(model)
    db.commit()
    db.refresh(agent)
    db.refresh(model)
    return _agent_out(db, agent)


@router.post("/{agent_id}/train", status_code=201)
def train_agent(
    agent_id: int,
    body: TrainAgentIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    agent = db.get(Agent, agent_id)
    if not agent or agent.owner_id != user.id:
        raise HTTPException(404, "Agent not found")
    job = TrainingJob(
        agent_id=agent.id,
        env_game=body.game,
        algo=body.algo,
        hyperparams=body.hyperparams or {},
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return {"job_id": job.id, "status": job.status}
