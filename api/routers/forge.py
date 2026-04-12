"""
MERIDIAN OSINT Platform — Forge API Router (Strategy Planner)

This router handles the intelligence reporting and Structural Analytic Techniques (SAT)
interfaces for the Forge tactical module. It serves the intelligence reports,
SAT templates, and evidence markers to the frontend React application.
"""
from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter()

# ──────────────────────────────────────────────────────────────────────────────
# Intelligence Reports Schema Definition
# ──────────────────────────────────────────────────────────────────────────────
# In a production environment, this data would be fetched asynchronously from 
# PostgreSQL via SQLAlchemy models. Here, it is securely cached in-memory 
# for performance during the V3 Alpha.
reports = [
    {
        "id": "RPT-2026-0147",
        "title": "Kirkuk Governorate — Sectarian Dynamics Assessment Q2 2026",
        "classification": "CONFIDENTIAL",
        "author": "Mohammed A. Mohammed",
        "status": "draft",
        "lastModified": "2026-04-10T18:30:00Z",
        "template": "Intelligence Assessment",
        "sections": 8,
        "sources": 24,
        "wordCount": 4280,
        "stiRelevance": ["Arab-Kurd-Turkmen", "Ethno-Religious Minorities"],
        "collaborators": ["Rasha K.", "Ahmed S."],
    },
    {
        "id": "RPT-2026-0146",
        "title": "PMF Force Disposition — Diyala Province Update",
        "classification": "SECRET",
        "author": "Ahmed S. Ibrahim",
        "status": "review",
        "lastModified": "2026-04-10T14:15:00Z",
        "template": "Military Assessment",
        "sections": 6,
        "sources": 18,
        "wordCount": 3150,
        "stiRelevance": ["Sunni-Shia"],
        "collaborators": ["Mohammed A."],
    },
    {
        "id": "RPT-2026-0142",
        "title": "Basra Water Crisis — Climate-Security Nexus Brief",
        "classification": "RESTRICTED",
        "author": "Sara M. Hassan",
        "status": "published",
        "lastModified": "2026-04-09T09:00:00Z",
        "template": "Policy Brief",
        "sections": 5,
        "sources": 31,
        "wordCount": 5620,
        "stiRelevance": ["Intra-Shia", "Tribal"],
        "collaborators": ["Mohammed A.", "Noor F."],
    },
    {
        "id": "RPT-2026-0139",
        "title": "KDP-PUK Relations — Post-Election Scenario Analysis",
        "classification": "CONFIDENTIAL",
        "author": "Mohammed A. Mohammed",
        "status": "published",
        "lastModified": "2026-04-08T16:45:00Z",
        "template": "Scenario Brief",
        "sections": 7,
        "sources": 15,
        "wordCount": 3880,
        "stiRelevance": ["KDP-PUK"],
        "collaborators": [],
    },
    {
        "id": "RPT-2026-0135",
        "title": "Sinjar Agreement — Implementation Failure Analysis",
        "classification": "RESTRICTED",
        "author": "Rasha K. Ahmed",
        "status": "archived",
        "lastModified": "2026-04-06T11:20:00Z",
        "template": "ACH Workbook",
        "sections": 4,
        "sources": 22,
        "wordCount": 6100,
        "stiRelevance": ["Ethno-Religious Minorities"],
        "collaborators": ["Mohammed A.", "Ahmed S."],
    },
]

# ──────────────────────────────────────────────────────────────────────────────
# SAT (Structured Analytic Techniques) Templates
# ──────────────────────────────────────────────────────────────────────────────
# Used to populate the Intelligence Analyst framework in the Forge View.
sat_templates = [
    {"id": "ach", "name": "Analysis of Competing Hypotheses", "icon": "🔬", "count": 12, "description": "Evaluate evidence against multiple hypotheses"},
    {"id": "ka", "name": "Key Assumptions Check", "icon": "🎯", "count": 8, "description": "Identify and challenge foundational assumptions"},
    {"id": "rt", "name": "Red Team Analysis", "icon": "🔴", "count": 5, "description": "Adversarial perspective and devil's advocate"},
    {"id": "what-if", "name": "What-If / Scenario", "icon": "🔀", "count": 15, "description": "Explore alternative futures and contingencies"},
    {"id": "indicators", "name": "Indicators & Warnings", "icon": "⚡", "count": 9, "description": "Define signposts for escalation/de-escalation"},
    {"id": "timeline", "name": "Chronological Reconstruction", "icon": "📅", "count": 7, "description": "Sequence events to identify patterns"},
]

# ──────────────────────────────────────────────────────────────────────────────
# Evidence Data Sources
# ──────────────────────────────────────────────────────────────────────────────
# Represents classified field intelligence mapped by reliability grade (HUMINT, OSINT, etc.)
evidence_items = [
    {"id": "EV-847", "type": "SIGINT", "grade": "B2", "source": "Al Sumaria TV", "date": "2026-04-10", "relevance": "Kirkuk PMF", "reliability": "Usually reliable"},
    {"id": "EV-846", "type": "OSINT", "grade": "A1", "source": "ACLED Database", "date": "2026-04-10", "relevance": "Diyala conflict", "reliability": "Completely reliable"},
    {"id": "EV-845", "type": "HUMINT", "grade": "C3", "source": "Field Contact #12", "date": "2026-04-09", "relevance": "Basra unrest", "reliability": "Fairly reliable"},
    {"id": "EV-844", "type": "OSINT", "grade": "B1", "source": "Rudaw News", "date": "2026-04-09", "relevance": "KDP-PUK talks", "reliability": "Usually reliable"},
    {"id": "EV-843", "type": "GEOINT", "grade": "A2", "source": "Sentinel-2", "date": "2026-04-09", "relevance": "Sinjar movements", "reliability": "Completely reliable"},
    {"id": "EV-842", "type": "SOCMINT", "grade": "D4", "source": "Telegram Channel", "date": "2026-04-08", "relevance": "Sadrist rhetoric", "reliability": "Not usually reliable"},
    {"id": "EV-841", "type": "OSINT", "grade": "B2", "source": "NRT Arabic", "date": "2026-04-08", "relevance": "Turkmen ITC protest", "reliability": "Usually reliable"},
]

# ──────────────────────────────────────────────────────────────────────────────
# API Endpoints
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/reports", description="Returns the list of all active intelligence reports.", tags=["forge"])
async def get_reports():
    """
    Fetch the currently active intelligence reports.
    Returns a JSON array of dicts containing report metadata like classification,
    status, and author assignment.
    """
    return reports

@router.get("/sat-templates", description="Returns the SAT templates for the Intelligence Matrix.", tags=["forge"])
async def get_sat_templates():
    """
    Fetch all available Structured Analytic Techniques.
    Used by analysts to select methodologies like ACH or Red Teaming.
    """
    return sat_templates

@router.get("/evidence-items", description="Returns the SIGINT/HUMINT evidence markers.", tags=["forge"])
async def get_evidence_items():
    """
    Retrieve raw field intelligence.
    These items are cross-linked to reports and have specific grading metrics.
    """
    return evidence_items
