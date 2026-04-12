# ═══════════════════════════════════════════════════════════════════
# MERIDIAN — Actors API Routes
# apps/api/routers/actors.py
# ═══════════════════════════════════════════════════════════════════

from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


class ActorResponse(BaseModel):
    id: str
    name: str
    name_ar: Optional[str] = None
    type: str
    category: str
    country: str = "Iraq"
    affiliation: Optional[str] = None
    description: str
    connections: int = 0
    risk_level: str = "low"
    last_active: Optional[str] = None


@router.get("/", response_model=List[ActorResponse])
async def list_actors(
    search: Optional[str] = Query(default=None, description="Search by name"),
    type: Optional[str] = Query(default=None, description="Filter by type"),
    risk: Optional[str] = Query(default=None, description="Filter by risk level"),
):
    """
    List actor entities with filtering.
    
    PRD: FR-NEX-001, FR-NEX-002
    Access: Analyst+
    """
    from apps.api.services.sti_engine import STIEngine
    engine = STIEngine()
    return await engine.get_actors(search=search, actor_type=type, risk=risk)


@router.get("/{actor_id}", response_model=ActorResponse)
async def get_actor(actor_id: str):
    """Get single actor by ID."""
    from apps.api.services.sti_engine import STIEngine
    engine = STIEngine()
    actors = await engine.get_actors()
    for actor in actors:
        if actor["id"] == actor_id:
            return actor
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Actor not found")
