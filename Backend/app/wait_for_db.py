"""Wait for Postgres before starting API (used in Docker entrypoint)."""
import os
import sys
import time

import psycopg2

host = os.environ.get("POSTGRES_HOST", "localhost")
port = int(os.environ.get("POSTGRES_PORT", "5432"))
user = os.environ.get("POSTGRES_USER", "postgres")
password = os.environ.get("POSTGRES_PASSWORD", "postgres")
dbname = os.environ.get("POSTGRES_DB", "agent_battleground")

for i in range(60):
    try:
        conn = psycopg2.connect(
            host=host, port=port, user=user, password=password, dbname=dbname
        )
        conn.close()
        print("Database is ready.")
        sys.exit(0)
    except Exception as e:
        print(f"Waiting for database... ({i + 1}/60) {e}")
        time.sleep(2)
print("Database not reachable.")
sys.exit(1)
