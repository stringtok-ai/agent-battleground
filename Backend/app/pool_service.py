from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.constants import DEMO_POOL_JOIN_MINUTES, DEMO_POOL_RUN_MINUTES, DEMO_POOL_START_MINUTES
from app.models import Agent, AgentModel, Contest, ContestEntry, MatchResult, User
from app.parameter_engine import build_pool_config, build_pool_config_report, generate_anti_overfit_seed, rng_from_contest
from app.wallet_service import adjust_balance


def contest_filled_slots(db: Session, contest_id: int) -> int:
    return db.query(func.count(ContestEntry.id)).filter(ContestEntry.contest_id == contest_id).scalar() or 0


def _recycle_empty_pool(db: Session, contest: Contest) -> None:
    """Re-open an empty pool with fresh windows so the demo never stays cancelled."""
    now = datetime.now(timezone.utc)
    contest.status = "open"
    contest.join_deadline = now + timedelta(minutes=DEMO_POOL_JOIN_MINUTES)
    contest.starts_at = now + timedelta(minutes=DEMO_POOL_START_MINUTES)
    contest.ends_at = now + timedelta(minutes=DEMO_POOL_START_MINUTES + DEMO_POOL_RUN_MINUTES)
    contest.winner_agent_id = None
    contest.pool_config_report = None
    contest.anti_overfit_seed_hex = generate_anti_overfit_seed()
    contest.config_params = build_pool_config(
        contest.pool_tier,
        contest.game,
        contest.anti_overfit_seed_hex,
        contest.id,
    )


def _model_reward_hint(db: Session, model_id: int) -> float:
    model = db.get(AgentModel, model_id)
    if not model or not isinstance(model.metrics, dict):
        return 0.0
    try:
        return float(model.metrics.get("mean_reward", 0.0))
    except (TypeError, ValueError):
        return 0.0


def _soccer_rows(db: Session, contest: Contest, entries: list[ContestEntry]) -> list[tuple[ContestEntry, float, dict[str, Any]]]:
    rng = rng_from_contest(contest.anti_overfit_seed_hex, contest.id, "soccer")
    if contest.game == "soccertwos":
        half = max(1, len(entries) // 2)
        team_a = entries[:half]
        team_b = entries[half:]
        if not team_b:
            team_b = team_a[-1:]
        def attack(entry: ContestEntry) -> float:
            agent = db.get(Agent, entry.agent_id)
            if not agent:
                return 0.0
            reward = _model_reward_hint(db, entry.model_id)
            return agent.elo / 120.0 + agent.mmr / 180.0 + reward * 4.5 + rng.gauss(0, 2.2)
        def defense(entry: ContestEntry) -> float:
            agent = db.get(Agent, entry.agent_id)
            if not agent:
                return 0.0
            reward = _model_reward_hint(db, entry.model_id)
            return agent.consistency * 28.0 + reward * 2.0 + rng.gauss(0, 1.1)
        atk_a = sum(attack(e) for e in team_a)
        atk_b = sum(attack(e) for e in team_b)
        def_a = sum(defense(e) for e in team_a)
        def_b = sum(defense(e) for e in team_b)
        goals_a = max(0, int(round((atk_a - def_b) / 20.0 + rng.uniform(0, 1.2))))
        goals_b = max(0, int(round((atk_b - def_a) / 20.0 + rng.uniform(0, 1.2))))
        winner = "A" if goals_a >= goals_b else "B"
        rows: list[tuple[ContestEntry, float, dict[str, Any]]] = []
        for entry in entries:
            side = "A" if entry in team_a else "B"
            gf, ga = (goals_a, goals_b) if side == "A" else (goals_b, goals_a)
            score = gf * 120 - ga * 70 + rng.gauss(0, 8)
            rows.append(
                (
                    entry,
                    score,
                    {
                        "mode": "soccer",
                        "team": side,
                        "goals_for": gf,
                        "goals_against": ga,
                        "result": "win" if side == winner else "loss",
                    },
                )
            )
        return rows

    # strikersvsgoalie (one goalie vs strikers)
    goalie = entries[-1]
    strikers = entries[:-1] or entries
    goalie_agent = db.get(Agent, goalie.agent_id)
    goalie_block = (goalie_agent.consistency * 32.0 if goalie_agent else 12.0) + _model_reward_hint(db, goalie.model_id) * 2.5 + rng.gauss(0, 1.6)
    striker_pressure = 0.0
    for entry in strikers:
        a = db.get(Agent, entry.agent_id)
        if not a:
            continue
        striker_pressure += a.elo / 140.0 + a.mmr / 200.0 + _model_reward_hint(db, entry.model_id) * 4.0 + rng.gauss(0, 1.8)
    striker_pressure = striker_pressure / max(1, len(strikers))
    striker_goals = max(0, int(round((striker_pressure - goalie_block) / 7.0 + rng.uniform(0, 1.0))))
    striker_win = striker_goals > 0
    rows = []
    for entry in strikers:
        score = striker_goals * 160 + rng.gauss(0, 10)
        rows.append(
            (
                entry,
                score,
                {
                    "mode": "strikers_vs_goalie",
                    "role": "striker",
                    "goals_scored": striker_goals,
                    "result": "win" if striker_win else "loss",
                },
            )
        )
    goalie_score = (220 if not striker_win else -120 * striker_goals) + goalie_block * 4 + rng.gauss(0, 8)
    rows.append(
        (
            goalie,
            goalie_score,
            {
                "mode": "strikers_vs_goalie",
                "role": "goalie",
                "goals_conceded": striker_goals,
                "result": "win" if not striker_win else "loss",
            },
        )
    )
    return rows


def settle_contest(db: Session, contest: Contest) -> None:
    if contest.status not in ("locked", "running"):
        return
    entries = db.query(ContestEntry).filter(ContestEntry.contest_id == contest.id).all()
    if not entries:
        _recycle_empty_pool(db, contest)
        return

    if contest.game in ("soccertwos", "strikersvsgoalie"):
        rows = _soccer_rows(db, contest, entries)
    else:
        rng = rng_from_contest(contest.anti_overfit_seed_hex, contest.id, "score")
        rows = []
        for e in entries:
            agent = db.get(Agent, e.agent_id)
            if not agent:
                continue
            model_hint = _model_reward_hint(db, e.model_id) * 12.0
            noise = rng.gauss(0, 25)
            base = float(agent.elo) * 0.6 + float(agent.mmr) * 0.15
            obs_n = float(contest.config_params.get("observation_noise_sigma", 0.05))
            latency = float(contest.config_params.get("action_latency_ms", 20))
            score = base + model_hint + noise - obs_n * 400 - latency * 0.3
            metrics = {
                "elo": agent.elo,
                "mmr": agent.mmr,
                "model_reward_hint": round(model_hint, 3),
                "noise": round(noise, 4),
                "penalty_obs_noise": round(obs_n * 400, 2),
                "penalty_latency": round(latency * 0.3, 2),
            }
            rows.append((e, score, metrics))

    if not rows:
        _recycle_empty_pool(db, contest)
        return

    rows.sort(key=lambda x: x[1], reverse=True)
    prize_split = contest.prize_split or {}
    winner_pct = int(prize_split.get("winner_pct", 80))
    winner_share = int(contest.prize_pool_cents * winner_pct / 100)

    for rank, (entry, score, metrics) in enumerate(rows, start=1):
        mr = MatchResult(
            contest_id=contest.id,
            agent_id=entry.agent_id,
            model_id=entry.model_id,
            score=score,
            metrics=metrics,
            rank=rank,
            replay_uri=None,
        )
        db.add(mr)

    winner_entry = rows[0][0]
    contest.winner_agent_id = winner_entry.agent_id
    owner = db.get(User, winner_entry.user_id)
    if owner:
        adjust_balance(
            db,
            owner.id,
            winner_share,
            "contest_prize",
            ref_type="contest",
            ref_id=contest.id,
            idempotency_key=f"prize:{contest.id}:{owner.id}",
            meta={"rank": 1},
        )

    result_payload = [
        {"agent_id": e.agent_id, "user_id": e.user_id, "score": round(s, 4), "metrics": m}
        for e, s, m in rows
    ]
    contest.pool_config_report = build_pool_config_report(
        contest.id,
        contest.game,
        contest.pool_tier,
        dict(contest.config_params),
        contest.anti_overfit_seed_hex,
        contest.winner_agent_id,
        result_payload,
    )
    contest.status = "settled"
    contest.ends_at = datetime.now(timezone.utc)
