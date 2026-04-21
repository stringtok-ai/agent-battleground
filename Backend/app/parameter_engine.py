"""Contest pool parameters derived from anti-overfit seed (investor demo)."""
from __future__ import annotations

import hashlib
import os
import random
import struct
from typing import Any


def rng_from_contest(anti_overfit_seed_hex: str, contest_id: int, salt: str) -> random.Random:
    raw = f"{anti_overfit_seed_hex}:{contest_id}:{salt}".encode()
    digest = hashlib.sha256(raw).digest()
    seed_int = struct.unpack(">Q", digest[:8])[0]
    return random.Random(seed_int)


def generate_anti_overfit_seed() -> str:
    return hashlib.sha256(os.urandom(32)).hexdigest()


def build_pool_config(
    pool_tier: str,
    game: str,
    anti_overfit_seed_hex: str,
    contest_id: int,
) -> dict[str, Any]:
    rng = rng_from_contest(anti_overfit_seed_hex, contest_id, "cfg")
    tier_mult = {"micro": 0.7, "standard": 1.0, "high": 1.3}.get(pool_tier, 1.0)
    return {
        "game": game,
        "pool_tier": pool_tier,
        "observation_noise_sigma": round(rng.uniform(0.02, 0.12) * tier_mult, 4),
        "action_latency_ms": int(rng.randint(5, 45) * tier_mult),
        "reward_shaping_factor": round(rng.uniform(0.85, 1.15), 4),
        "frame_skip": rng.randint(1, 3),
        "max_episode_steps": rng.choice([256, 512, 768, 1024]),
        "opponent_difficulty": round(rng.uniform(0.4, 0.95), 3),
    }


def build_pool_config_report(
    contest_id: int,
    game: str,
    pool_tier: str,
    config_params: dict[str, Any],
    anti_overfit_seed_hex: str,
    winner_agent_id: int | None,
    results: list[dict[str, Any]],
) -> dict[str, Any]:
    return {
        "contest_id": contest_id,
        "game": game,
        "pool_tier": pool_tier,
        "config_params": config_params,
        "anti_overfit_seed_hex": anti_overfit_seed_hex,
        "winner_agent_id": winner_agent_id,
        "results": results,
        "notes": "Scores mix agent ELO/MMR with seed-stable noise for anti-cheat demo.",
    }
