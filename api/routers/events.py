# ═══════════════════════════════════════════════════════════════════
# MERIDIAN — Events API Routes
# apps/api/routers/events.py
# ═══════════════════════════════════════════════════════════════════

from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()


class EventResponse(BaseModel):
    id: str
    title: str
    title_ar: Optional[str] = None
    type: str
    severity: str
    location: str
    governorate: Optional[str] = None
    country: str = "Iraq"
    timestamp: datetime
    source: str
    language: str
    sentiment: Optional[float] = None
    sti_relevant: bool = False
    sti_axes: List[str] = []
    summary: Optional[str] = None
    entities: List[str] = []
    verified: bool = False


@router.get("/", response_model=List[EventResponse])
async def list_events(
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
    type: Optional[str] = Query(default=None, description="Filter by event type"),
    severity: Optional[str] = Query(default=None, description="Filter by severity"),
    governorate: Optional[str] = Query(default=None, description="Filter by governorate"),
    sti_only: bool = Query(default=False, description="Only STI-relevant events"),
    verified_only: bool = Query(default=False, description="Only verified events"),
):
    """
    List intelligence events with filtering.
    
    PRD: FR-SIG-001, FR-SIG-002
    Access: Observer+
    """
    # When backend is live, this queries PostgreSQL
    # For now, return simulated data via the engine
    from services.sti_engine import STIEngine
    engine = STIEngine()
    return await engine.get_events(
        limit=limit, offset=offset, event_type=type,
        severity=severity, governorate=governorate,
        sti_only=sti_only, verified_only=verified_only,
    )


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str):
    """Get single event by ID."""
    from services.sti_engine import STIEngine
    engine = STIEngine()
    events = await engine.get_events(limit=100)
    for evt in events:
        if evt["id"] == event_id:
            return evt
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Event not found")
