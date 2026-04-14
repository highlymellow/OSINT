# ═══════════════════════════════════════════════════════════════════
# MERIDIAN — Application Configuration
# apps/api/core/config.py
# ═══════════════════════════════════════════════════════════════════

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Main application settings. Loaded from environment variables."""

    # ── Application ──────────────────────────────────────────────
    MERIDIAN_ENV: str = "development"
    MERIDIAN_BACKEND_LIVE: bool = False
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_DEBUG: bool = True
    SECRET_KEY: str = "dev-secret-change-in-production"

    # ── PostgreSQL ───────────────────────────────────────────────
    DATABASE_URL: str = "postgresql://meridian:meridian_dev_2026@localhost:5432/meridian"

    # ── TimescaleDB ──────────────────────────────────────────────
    TIMESCALE_URL: str = "postgresql://meridian:meridian_ts_2026@localhost:5433/meridian_ts"

    # ── Redis ────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── Elasticsearch ────────────────────────────────────────────
    ELASTICSEARCH_URL: str = "http://localhost:9200"

    # ── Neo4j ────────────────────────────────────────────────────
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "meridian_graph_2026"

    # ── Kafka ────────────────────────────────────────────────────
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:19092"

    # ── STI Engine ───────────────────────────────────────────────
    STI_REFRESH_INTERVAL_SECONDS: int = 900     # 15 minutes
    STI_WEBSOCKET_THRESHOLD: float = 2.0        # Push if delta > 2 pts
    STI_CACHE_TTL_SECONDS: int = 60

    # ── Auth (Keycloak) ──────────────────────────────────────────
    KEYCLOAK_URL: Optional[str] = None
    KEYCLOAK_REALM: str = "meridian"
    KEYCLOAK_CLIENT_ID: str = "meridian-api"

    # ── OSINT API Keys (optional — systems degrade gracefully) ───
    OPENSKY_USERNAME: Optional[str] = None
    OPENSKY_PASSWORD: Optional[str] = None
    SHODAN_API_KEY: Optional[str] = None
    ADSB_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
