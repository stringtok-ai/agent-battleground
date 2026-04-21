SKU_PRICES_CENTS = {
    "starter": 9_900,
    "pro": 19_900,
    "elite": 49_900,
}

DEFAULT_DEMO_BALANCE_CENTS = 500_000

# Added each time the user hits "Claim (demo)" in the wallet UI (POC).
DEMO_CLAIM_CREDITS_CENTS = 50_000

# Demo contest pools: join until DEMO_POOL_JOIN_MINUTES, then start/settle at DEMO_POOL_START_MINUTES (5-minute cadence).
DEMO_POOL_JOIN_MINUTES = 4
DEMO_POOL_START_MINUTES = 5
DEMO_POOL_RUN_MINUTES = 5

# Always keep at least this many open demo contests (scheduler + list API top-up).
# 13 = one open pool per catalog game in the demo rotation.
MIN_OPEN_DEMO_CONTESTS = 13
