# ═══════════════════════════════════════════════════════════════════
# MERIDIAN — Health Check Route
# apps/api/routers/health.py
# ═══════════════════════════════════════════════════════════════════

from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()


@router.get("/health")
async def health_check():
    """System health check — verifies API is responsive."""
    return {
        "status": "healthy",
        "platform": "MERIDIAN",
        "version": "2.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "api": "operational",
            "database": "not_connected",   # Will check PG when live
            "timescaledb": "not_connected",
            "redis": "not_connected",
            "elasticsearch": "not_connected",
            "neo4j": "not_connected",
            "kafka": "not_connected",
        },
    }
