# ═══════════════════════════════════════════════════════════════════
# MERIDIAN — STI API Routes
# apps/api/routers/sti.py | PRD Section 8 + Section 18 Step 7
# ═══════════════════════════════════════════════════════════════════
# Endpoints:
#   GET /api/v1/sti/current              — Current national STI
#   GET /api/v1/sti/current/{location}   — Current governorate STI
#   GET /api/v1/sti/history              — Historical time-series
#   GET /api/v1/sti/governorates         — All governorate scores
#   GET /api/v1/sti/axes                 — Axis definitions + current scores
#   POST /api/v1/sti/compute             — Trigger recomputation (admin)
# ═══════════════════════════════════════════════════════════════════

from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
from enum import Enum

from core.config import settings
from services.sti_engine import STIEngine

router = APIRouter()
sti_engine = STIEngine()


# ── Response Models ──────────────────────────────────────────────

class STIStatus(str, Enum):
    STABLE = "STABLE"
    LOW = "LOW"
    ELEVATED = "ELEVATED"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class STITrend(str, Enum):
    UP = "up"
    DOWN = "down"
    STABLE = "stable"

class AxisScore(BaseModel):
    id: str
    name: str
    name_ar: Optional[str] = None
    score: float = Field(ge=0, le=100)
    previous_score: Optional[float] = None
    weight: float = Field(ge=0, le=1)
    signals: int = 0
    trend: STITrend = STITrend.STABLE
    color: Optional[str] = None

class STICurrentResponse(BaseModel):
    composite: float = Field(ge=0, le=100)
    previous_composite: Optional[float] = None
    delta: Optional[float] = None
    status: STIStatus
    confidence: float = Field(ge=0, le=1)
    trend: STITrend
    last_updated: datetime
    level: str = "national"
    location_id: str = "IQ"
    location_name: str = "Iraq"
    axes: List[AxisScore]
    signals_count: int = 0
    model_version: str = "v2.0"

class GovernorateScore(BaseModel):
    id: str
    name: str
    name_ar: Optional[str] = None
    score: float
    status: str
    trend: str
    top_axis: str

class TimeSeriesPoint(BaseModel):
    timestamp: str
    value: float

class STIHistoryResponse(BaseModel):
    location_id: str
    period: str
    points: List[TimeSeriesPoint]


# ── Endpoints ────────────────────────────────────────────────────

@router.get("/current", response_model=STICurrentResponse)
async def get_current_sti(
    location: str = Query(default="IQ", description="Location ID (IQ for national, governorate code for local)")
):
    """
    Get current STI score — national or governorate level.
    
    PRD: FR-STI-001, FR-STI-002, FR-STI-003
    Access: Observer+ (national), Analyst+ (governorate breakdown)
    """
    data = await sti_engine.get_current(location)
    if data is None:
        raise HTTPException(status_code=404, detail=f"No STI data for location: {location}")
    return data


@router.get("/governorates", response_model=List[GovernorateScore])
async def get_governorate_scores():
    """
    Get all governorate STI scores, sorted by score descending.
    
    PRD: FR-STI-004, FR-STI-005
    Access: Analyst+
    """
    return await sti_engine.get_all_governorates()


@router.get("/history", response_model=STIHistoryResponse)
async def get_sti_history(
    location: str = Query(default="IQ", description="Location ID"),
    period: str = Query(default="30d", description="Time period: 7d, 30d, 90d, 1y, all"),
):
    """
    Get historical STI time-series data.
    
    PRD: FR-STI-006, FR-STI-007
    Access: Analyst+
    """
    return await sti_engine.get_history(location, period)


@router.get("/axes")
async def get_axes():
    """
    Get STI axis definitions with current scores and methodology.
    
    PRD: Section 8 — STI Methodology
    Access: Observer+
    """
    return await sti_engine.get_axes()


@router.post("/compute")
async def trigger_computation():
    """
    Trigger a manual STI recomputation.
    
    PRD: FR-STI-015 (admin override)
    Access: Professional+
    """
    result = await sti_engine.compute_now()
    return {"status": "computed", "result": result}
