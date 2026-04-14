# ═══════════════════════════════════════════════════════════════════
# MERIDIAN — FastAPI Application
# apps/api/main.py | PRD Section 18 Step 3
# ═══════════════════════════════════════════════════════════════════
# Run: uvicorn apps.api.main:app --reload --port 8000

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time
import logging
import sys
import os

# Appease VS Code / Pyright Linter module resolution
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.config import settings
from routers import sti, events, actors, health, foresight, forge, lens, pulse, osint_proxy, satellites, maritime, correlation, flights, radio, shodan_search, cctv, cyber, escalation

logger = logging.getLogger("meridian")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("═" * 60)
    logger.info("MERIDIAN API v2.0 starting...")
    logger.info(f"Environment: {settings.MERIDIAN_ENV}")
    logger.info(f"Database: {'LIVE' if settings.MERIDIAN_BACKEND_LIVE else 'SIMULATED'}")
    logger.info("═" * 60)
    yield
    logger.info("MERIDIAN API shutting down.")


app = FastAPI(
    title="MERIDIAN API",
    description="Geo-Political OSINT Platform — Iraq and MENA Region",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # Next.js dev
        "http://localhost:5173",    # Vite React dev
        "http://127.0.0.1:5173",    # Vite Python mapping
        "https://meridian.app",     # Default Production
    ] + [origin for origin in os.getenv("CORS_ORIGINS", "").split(",") if origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request timing middleware ────────────────────────────────────
@app.middleware("http")
async def add_timing_header(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    response.headers["X-Process-Time"] = f"{duration:.3f}"
    response.headers["X-Meridian-Version"] = "2.0.0"
    return response


# ── Route Registration ───────────────────────────────────────────
app.include_router(health.router, tags=["Health"])
app.include_router(sti.router, prefix="/api/v1/sti", tags=["STI"])
app.include_router(events.router, prefix="/api/v1/events", tags=["Events"])
app.include_router(actors.router, prefix="/api/v1/actors", tags=["Actors"])
app.include_router(foresight.router, prefix="/api/v1/foresight", tags=["Foresight"])
app.include_router(forge.router, prefix="/api/v1/forge", tags=["Forge"])
app.include_router(lens.router, prefix="/api/v1/lens", tags=["Lens"])
app.include_router(pulse.router, prefix="/api/v1/pulse", tags=["Pulse"])
app.include_router(osint_proxy.router, prefix="/api/v1/osint", tags=["OSINT Proxy"])
app.include_router(satellites.router, prefix="/api/v1/satellites", tags=["Satellites"])
app.include_router(maritime.router, prefix="/api/v1/maritime", tags=["Maritime"])
app.include_router(correlation.router, prefix="/api/v1/correlation", tags=["Correlation"])
app.include_router(flights.router, prefix="/api/v1/flights", tags=["Flights"])
app.include_router(radio.router, prefix="/api/v1/radio", tags=["Radio"])
app.include_router(shodan_search.router, prefix="/api/v1/shodan", tags=["Shodan"])
app.include_router(cctv.router, prefix="/api/v1/cctv", tags=["CCTV"])
app.include_router(cyber.router, prefix="/api/v1/cyber", tags=["Cyber Threats"])
app.include_router(escalation.router, prefix="/api/v1/escalation", tags=["Escalation Predictor"])


# ── Root ─────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "platform": "MERIDIAN",
        "version": "2.0.0",
        "description": "Geo-Political OSINT Platform — Iraq and MENA",
        "author": "Mohammed Anwer Mohammed",
        "docs": "/api/docs",
        "status": "operational",
    }
