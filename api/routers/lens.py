"""
MERIDIAN OSINT Platform — Lens API Router (Social / Narratives Tracker)

This router serves Social Media Intelligence (SOCMINT), trending narratives,
coordinated disinformation campaigns, and media credibility scores. It tracks
disinformation trajectories across platforms like Telegram and Facebook.
"""
from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter()

platform_stats = [
  {"platform": "Telegram", "posts": "8,420", "trend": "+24%", "color": "#0088cc", "icon": "📨"},
  {"platform": "Facebook (Iraqi)", "posts": "12,380", "trend": "+8%", "color": "#1877F2", "icon": "📘"},
  {"platform": "X / Twitter", "posts": "5,910", "trend": "-3%", "color": "#1DA1F2", "icon": "🐦"},
]

trending_narratives = [
  {"narrative": "Budget allocation dispute escalation", "volume": 2847, "sentiment": -0.68, "platforms": ["Telegram", "Facebook"], "stiRelevant": True, "disinfoRisk": "LOW"},
  {"narrative": "Peshmerga-ISF Makhmur standoff (Arabic framing)", "volume": 1923, "sentiment": -0.82, "platforms": ["X", "Telegram"], "stiRelevant": True, "disinfoRisk": "MEDIUM"},
  {"narrative": "Counter-narrative: cross-sectarian electoral reform", "volume": 987, "sentiment": 0.45, "platforms": ["Facebook", "X"], "stiRelevant": True, "disinfoRisk": "NONE"},
  {"narrative": "IRGC anti-US messaging campaign (coordinated)", "volume": 3210, "sentiment": -0.91, "platforms": ["Telegram"], "stiRelevant": True, "disinfoRisk": "HIGH"},
  {"narrative": "Turkmen property seizures in Kirkuk (ITF documentation)", "volume": 1456, "sentiment": -0.87, "platforms": ["Facebook", "Telegram"], "stiRelevant": True, "disinfoRisk": "LOW"},
  {"narrative": "Southern marshland drought displacement coverage", "volume": 642, "sentiment": -0.55, "platforms": ["Facebook", "YouTube"], "stiRelevant": False, "disinfoRisk": "NONE"},
]

# ──────────────────────────────────────────────────────────────────────────────
# Disinformation & Bot Campaigns
# ──────────────────────────────────────────────────────────────────────────────
# Tracks algorithmically-detected coordinated inauthentic behavior (CIB)
coordinated_campaigns = [
  {"name": "IRGC Anti-US Network", "accounts": 847, "origin": "Iran", "confidence": 0.92},
  {"name": "Pro-Sadrist Retweet Ring", "accounts": 234, "origin": "Iraq", "confidence": 0.78},
  {"name": "KDP Media Amplification", "accounts": 156, "origin": "Iraq (KRI)", "confidence": 0.65},
]

media_credibility = [
  {"name": "Rudaw", "score": 78, "bias": "Pro-KDP"},
  {"name": "Turkmeneli TV", "score": 62, "bias": "Pro-Turkmen/ITF"},
  {"name": "Al Sumaria", "score": 65, "bias": "Independent/Shia"},
  {"name": "Shafaq News", "score": 72, "bias": "Independent"},
  {"name": "NRT", "score": 70, "bias": "Pro-PUK"},
  {"name": "Al Jazeera Arabic", "score": 68, "bias": "Pan-Arab/Qatar"},
]

# ──────────────────────────────────────────────────────────────────────────────
# API Endpoints
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/platform-stats", description="SOCMINT ingestion statistics per platform.", tags=["lens"])
async def get_platform_stats():
    """Returns ingestion volumes and platform trends."""
    return platform_stats

@router.get("/trending-narratives", description="Semantic narrative analysis.", tags=["lens"])
async def get_trending_narratives():
    """Returns real-time semantic clusters of news and social media discussions."""
    return trending_narratives

@router.get("/coordinated-campaigns", description="CIB/Bot network detection.", tags=["lens"])
async def get_coordinated_campaigns():
    """Returns data on coordinated inauthentic behavior networks."""
    return coordinated_campaigns

@router.get("/media-credibility", description="Media source bias and validation scores.", tags=["lens"])
async def get_media_credibility():
    """Returns analytical grading of media publication bias."""
    return media_credibility
