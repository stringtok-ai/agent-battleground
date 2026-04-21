"""Create POSTGRES_DB on the server if it does not exist (local dev helper).

Run from the Backend directory:
  python scripts/ensure_database.py
"""
from __future__ import annotations

import sys
from pathlib import Path
from urllib.parse import quote_plus

import psycopg2
from psycopg2 import sql

_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from app.config import get_settings  # noqa: E402

settings = get_settings()
password = quote_plus(settings.postgres_password)
url = (
    f"postgresql://{settings.postgres_user}:{password}"
    f"@{settings.postgres_host}:{settings.postgres_port}/postgres"
)
conn = psycopg2.connect(url)
conn.autocommit = True
cur = conn.cursor()
cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (settings.postgres_db,))
if cur.fetchone():
    print(f"Database {settings.postgres_db!r} already exists.")
else:
    cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(settings.postgres_db)))
    print(f"Created database {settings.postgres_db!r}.")
cur.close()
conn.close()
