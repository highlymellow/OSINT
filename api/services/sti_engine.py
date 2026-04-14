# ═══════════════════════════════════════════════════════════════════
# MERIDIAN — STI Computation Engine
# apps/api/services/sti_engine.py | PRD Section 8
# ═══════════════════════════════════════════════════════════════════
#
# The Sectarianism Tension Index (STI) is computed as:
#
#   STI = Σ(axis_weight × axis_score) for all 6 axes
#
# Where each axis_score is derived from:
#   1. Signal ingestion (events, social media, reports)
#   2. NLP sentiment analysis
#   3. Exponentially weighted moving average (EWMA)
#   4. Z-score normalization against 2003-present baseline
#
# Current mode: SIMULATED (returns data.ts equivalent)
# Live mode: Reads from TimescaleDB + Redis cache
# ═══════════════════════════════════════════════════════════════════

from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional
import math
import random
import asyncpg
import json
import logging

from core.config import settings

logger = logging.getLogger("meridian.sti_engine")


class STIEngine:
    """
    Core STI computation engine.
    
    In SIMULATED mode (MERIDIAN_BACKEND_LIVE=false):
        Returns realistic simulated data matching src/lib/data.ts
    
    In LIVE mode (MERIDIAN_BACKEND_LIVE=true):
        Queries TimescaleDB for scores, Redis for cache
        Triggers recomputation from signal pipeline
    """

    # ── Axis Definitions (PRD Section 8, corrected for Turkmen) ──
    AXES = [
        {
            "id": "sunni-shia",
            "name": "Sunni-Shia",
            "name_ar": "سني-شيعي",
            "weight": 0.25,
            "color": "#C13A1B",
            "description": "Tracks sectarian tension between Sunni and Shia communities.",
        },
        {
            "id": "arab-kurd-turkmen",
            "name": "Arab-Kurd-Turkmen",
            "name_ar": "عربي-كردي-تركماني",
            "weight": 0.22,
            "color": "#D47B2A",
            "description": "Tracks the tri-ethnic dynamic in disputed territories (Article 140 areas): Kirkuk, Tuz Khurmatu, Tal Afar, Makhmur.",
        },
        {
            "id": "intra-shia",
            "name": "Intra-Shia",
            "name_ar": "داخل الشيعة",
            "weight": 0.18,
            "color": "#C9A84C",
            "description": "Tracks rivalry between Shia political factions: Sadrist Movement, Coordination Framework, ISCI, Badr.",
        },
        {
            "id": "kdp-puk",
            "name": "KDP-PUK",
            "name_ar": "پارتی-یەکێتی",
            "weight": 0.15,
            "color": "#D47B2A",
            "description": "Tracks tension between the two dominant Kurdish parties.",
        },
        {
            "id": "tribal",
            "name": "Tribal",
            "name_ar": "عشائري",
            "weight": 0.10,
            "color": "#5B9B3E",
            "description": "Tracks inter and intra-tribal disputes.",
        },
        {
            "id": "minority",
            "name": "Ethno-Religious Minorities",
            "name_ar": "الأقليات العرقية والدينية",
            "weight": 0.10,
            "color": "#C9A84C",
            "description": "Tracks tensions affecting Assyrians, Yazidis, Shabaks, Mandaeans, Armenians, Circassians, Afro-Iraqis.",
        },
    ]

    # ── Simulated Governorate Data ───────────────────────────────
    GOVERNORATES = [
        {"id": "bg",  "name": "Baghdad",       "name_ar": "بغداد",       "score": 71, "status": "HIGH",     "trend": "up",     "top_axis": "Sunni-Shia"},
        {"id": "bs",  "name": "Basra",          "name_ar": "البصرة",      "score": 48, "status": "ELEVATED", "trend": "stable",  "top_axis": "Intra-Shia"},
        {"id": "nn",  "name": "Nineveh",        "name_ar": "نينوى",       "score": 64, "status": "HIGH",     "trend": "up",     "top_axis": "Arab-Kurd-Turkmen"},
        {"id": "er",  "name": "Erbil",          "name_ar": "أربيل",       "score": 55, "status": "ELEVATED", "trend": "stable",  "top_axis": "KDP-PUK"},
        {"id": "su",  "name": "Sulaymaniyah",   "name_ar": "السليمانية",  "score": 52, "status": "ELEVATED", "trend": "down",   "top_axis": "KDP-PUK"},
        {"id": "kk",  "name": "Kirkuk",         "name_ar": "كركوك",       "score": 82, "status": "CRITICAL", "trend": "up",     "top_axis": "Arab-Kurd-Turkmen"},
        {"id": "tz",  "name": "Tuz Khurmatu",   "name_ar": "طوزخورماتو",  "score": 76, "status": "HIGH",     "trend": "up",     "top_axis": "Arab-Kurd-Turkmen"},
        {"id": "dy",  "name": "Diyala",         "name_ar": "ديالى",       "score": 73, "status": "HIGH",     "trend": "up",     "top_axis": "Sunni-Shia"},
        {"id": "sd",  "name": "Salahuddin",     "name_ar": "صلاح الدين",  "score": 60, "status": "ELEVATED", "trend": "up",     "top_axis": "Arab-Kurd-Turkmen"},
        {"id": "an",  "name": "Anbar",          "name_ar": "الأنبار",     "score": 45, "status": "ELEVATED", "trend": "down",   "top_axis": "Tribal"},
        {"id": "bbl", "name": "Babylon",        "name_ar": "بابل",        "score": 35, "status": "LOW",      "trend": "stable",  "top_axis": "Intra-Shia"},
        {"id": "kr",  "name": "Karbala",        "name_ar": "كربلاء",      "score": 28, "status": "LOW",      "trend": "down",   "top_axis": "Intra-Shia"},
        {"id": "nj",  "name": "Najaf",          "name_ar": "النجف",       "score": 32, "status": "LOW",      "trend": "stable",  "top_axis": "Intra-Shia"},
        {"id": "ws",  "name": "Wasit",          "name_ar": "واسط",        "score": 38, "status": "LOW",      "trend": "stable",  "top_axis": "Tribal"},
        {"id": "my",  "name": "Maysan",         "name_ar": "ميسان",       "score": 42, "status": "ELEVATED", "trend": "up",     "top_axis": "Tribal"},
        {"id": "dq",  "name": "Dhi Qar",       "name_ar": "ذي قار",      "score": 50, "status": "ELEVATED", "trend": "up",     "top_axis": "Intra-Shia"},
        {"id": "mu",  "name": "Muthanna",       "name_ar": "المثنى",      "score": 22, "status": "LOW",      "trend": "stable",  "top_axis": "Tribal"},
        {"id": "qd",  "name": "Qadisiyyah",    "name_ar": "القادسية",    "score": 30, "status": "LOW",      "trend": "down",   "top_axis": "Tribal"},
        {"id": "dh",  "name": "Duhok",          "name_ar": "دهوك",        "score": 44, "status": "ELEVATED", "trend": "stable",  "top_axis": "KDP-PUK"},
        {"id": "ha",  "name": "Halabja",        "name_ar": "حلبجة",       "score": 36, "status": "LOW",      "trend": "down",   "top_axis": "KDP-PUK"},
    ]

    # ── Simulated Axis Scores ────────────────────────────────────
    CURRENT_AXIS_SCORES = {
        "sunni-shia":        {"score": 72, "previous": 68, "signals": 847, "trend": "up"},
        "arab-kurd-turkmen": {"score": 64, "previous": 59, "signals": 741, "trend": "up"},
        "intra-shia":        {"score": 45, "previous": 43, "signals": 512, "trend": "up"},
        "kdp-puk":           {"score": 61, "previous": 58, "signals": 389, "trend": "up"},
        "tribal":            {"score": 38, "previous": 40, "signals": 234, "trend": "down"},
        "minority":          {"score": 46, "previous": 44, "signals": 256, "trend": "up"},
    }

    def __init__(self):
        self.is_live = settings.MERIDIAN_BACKEND_LIVE

    # ── Core Computation ─────────────────────────────────────────

    def compute_composite(self, axis_scores: Dict[str, float]) -> float:
        """
        Compute STI composite score from axis scores.
        
        Formula: STI = Σ(weight_i × score_i)
        Weights from AXES definitions (sum to 1.0).
        """
        total = 0.0
        for axis in self.AXES:
            score = axis_scores.get(axis["id"], 50.0)
            total += axis["weight"] * score
        return round(total, 2)

    def classify_status(self, score: float) -> str:
        """Map composite score to status classification."""
        if score >= 80: return "CRITICAL"
        if score >= 60: return "HIGH"
        if score >= 40: return "ELEVATED"
        if score >= 20: return "LOW"
        return "STABLE"

    # ── API Methods ──────────────────────────────────────────────

    async def get_current(self, location: str = "IQ") -> Optional[dict]:
        """Get current STI score for a location."""
        if self.is_live:
            return await self._get_live_current(location)

        # Simulated mode
        if location == "IQ":
            axis_scores = {}
            for axis in self.AXES:
                data = self.CURRENT_AXIS_SCORES[axis["id"]]
                axis_scores[axis["id"]] = data["score"]

            composite = self.compute_composite(axis_scores)
            return {
                "composite": composite,
                "previous_composite": 62.0,
                "delta": round(composite - 62.0, 2),
                "status": self.classify_status(composite),
                "confidence": 0.87,
                "trend": "up",
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "level": "national",
                "location_id": "IQ",
                "location_name": "Iraq",
                "axes": [
                    {
                        "id": axis["id"],
                        "name": axis["name"],
                        "name_ar": axis["name_ar"],
                        "score": self.CURRENT_AXIS_SCORES[axis["id"]]["score"],
                        "previous_score": self.CURRENT_AXIS_SCORES[axis["id"]]["previous"],
                        "weight": axis["weight"],
                        "signals": self.CURRENT_AXIS_SCORES[axis["id"]]["signals"],
                        "trend": self.CURRENT_AXIS_SCORES[axis["id"]]["trend"],
                        "color": axis["color"],
                    }
                    for axis in self.AXES
                ],
                "signals_count": sum(d["signals"] for d in self.CURRENT_AXIS_SCORES.values()),
                "model_version": "v2.0",
            }
        else:
            # Governorate lookup
            gov = next((g for g in self.GOVERNORATES if g["id"] == location), None)
            if gov is None:
                return None
            return {
                "composite": gov["score"],
                "status": gov["status"],
                "confidence": 0.75,
                "trend": gov["trend"],
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "level": "governorate",
                "location_id": gov["id"],
                "location_name": gov["name"],
                "axes": [],
                "signals_count": 0,
                "model_version": "v2.0",
            }

    async def get_all_governorates(self) -> List[dict]:
        """Get all governorate scores, sorted descending."""
        if self.is_live:
            return await self._get_live_governorates()
        return sorted(self.GOVERNORATES, key=lambda g: g["score"], reverse=True)

    async def get_history(self, location: str, period: str) -> dict:
        """Get historical STI time-series."""
        if self.is_live:
            return await self._get_live_history(location, period)
        period_days = {"7d": 7, "30d": 30, "90d": 90, "1y": 365, "all": 365}
        days = period_days.get(period, 30)

        points = []
        for i in range(days):
            date = datetime.now(timezone.utc) - timedelta(days=days - 1 - i)
            base = 55
            noise = math.sin(i * 0.5) * 8 + random.random() * 6
            trend = i * 0.3
            value = min(100, max(0, round(base + noise + trend)))
            points.append({
                "timestamp": date.strftime("%Y-%m-%d"),
                "value": value,
            })

        return {
            "location_id": location,
            "period": period,
            "points": points,
        }

    async def get_axes(self) -> List[dict]:
        """Get axis definitions with current scores."""
        result = []
        for axis in self.AXES:
            current = self.CURRENT_AXIS_SCORES.get(axis["id"], {})
            result.append({
                **axis,
                "current_score": current.get("score", 50),
                "signals": current.get("signals", 0),
                "trend": current.get("trend", "stable"),
            })
        return result

    async def get_events(self, limit=50, offset=0, event_type=None,
                   severity=None, governorate=None,
                   sti_only=False, verified_only=False) -> List[dict]:
        """Get events (simulated mode)."""
        # This returns the same data structure as data.ts
        # When live, it queries PostgreSQL
        events = self._simulated_events()
        
        if event_type:
            events = [e for e in events if e["type"] == event_type]
        if severity:
            events = [e for e in events if e["severity"] == severity]
        if governorate:
            events = [e for e in events if e.get("governorate", "").lower() == governorate.lower()]
        if sti_only:
            events = [e for e in events if e.get("sti_relevant", False)]
        if verified_only:
            events = [e for e in events if e.get("verified", False)]

        return events[offset:offset + limit]

    async def get_actors(self, search=None, actor_type=None, risk=None) -> List[dict]:
        """Get actors (simulated mode)."""
        actors = self._simulated_actors()
        
        if search:
            search_lower = search.lower()
            actors = [a for a in actors if search_lower in a["name"].lower() 
                      or search_lower in (a.get("name_ar") or "")]
        if actor_type:
            actors = [a for a in actors if a["type"] == actor_type]
        if risk:
            actors = [a for a in actors if a["risk_level"] == risk]

        return actors

    async def compute_now(self) -> dict:
        """Trigger recomputation (admin only)."""
        axis_scores = {axis["id"]: self.CURRENT_AXIS_SCORES[axis["id"]]["score"]
                       for axis in self.AXES}
        composite = self.compute_composite(axis_scores)
        return {
            "composite": composite,
            "status": self.classify_status(composite),
            "computed_at": datetime.now(timezone.utc).isoformat(),
            "mode": "simulated" if not self.is_live else "live",
        }

    # ── Live Mode Methods (require database) ─────────────────────

    async def _get_live_current(self, location: str) -> Optional[dict]:
        """Query TimescaleDB for current score."""
        try:
            conn = await asyncpg.connect(settings.DATABASE_URL)
            query = '''
                SELECT * FROM sti_scores 
                WHERE location_id = $1 
                ORDER BY timestamp DESC 
                LIMIT 1
            '''
            row = await conn.fetchrow(query, location)
            await conn.close()
            
            if not row:
                return None
                
            return {
                "composite": float(row['composite']),
                "previous_composite": float(row['previous']) if row['previous'] else None,
                "delta": float(row['delta']) if row['delta'] else None,
                "status": row['status'],
                "confidence": float(row['confidence']),
                "trend": row['trend'],
                "last_updated": row['timestamp'].isoformat(),
                "level": row['level'],
                "location_id": row['location_id'],
                "location_name": row['location_name'],
                "axes": json.loads(row['axis_scores']) if isinstance(row['axis_scores'], str) else row['axis_scores'],
                "signals_count": row['signals_count'],
                "model_version": row['model_version'],
            }
        except Exception as e:
            logger.error(f"Live DB Error (_get_live_current): {e}")
            raise e

    async def _get_live_governorates(self) -> List[dict]:
        """Query TimescaleDB for all governorate scores."""
        # Simple implementation for demo purposes: fallback to mock array structure but parsed via async
        raise NotImplementedError("Live gov list computation query structure required")
        
    async def _get_live_history(self, location: str, period: str) -> dict:
        """Query TimescaleDB for historic timeseries."""
        raise NotImplementedError("Live history continuous aggregate view query required")

    # ── Simulated Data ───────────────────────────────────────────

    def _simulated_events(self) -> List[dict]:
        """Return simulated events matching data.ts structure."""
        return [
            {"id": "evt-001", "title": "PMF Faction Issues Warning Over Budget Allocation Dispute", "type": "political", "severity": "high", "location": "Baghdad, Green Zone", "governorate": "Baghdad", "country": "Iraq", "timestamp": "2026-04-10T18:45:00Z", "source": "Al Sumaria News", "language": "Arabic", "sentiment": -0.72, "sti_relevant": True, "sti_axes": ["sunni-shia", "intra-shia"], "summary": "A major PMF political faction released a statement warning of consequences if Sunni-majority governorates receive disproportionate reconstruction funds.", "entities": ["PMF", "Iraqi Parliament", "Budget Committee"], "verified": True},
            {"id": "evt-002", "title": "Peshmerga-ISF Checkpoint Standoff Near Makhmur", "type": "security", "severity": "critical", "location": "Makhmur District", "governorate": "Nineveh", "country": "Iraq", "timestamp": "2026-04-10T17:30:00Z", "source": "Rudaw", "language": "Kurdish", "sentiment": -0.85, "sti_relevant": True, "sti_axes": ["arab-kurd-turkmen"], "summary": "Peshmerga and ISF engaged in standoff near Makhmur. Turkmen community leaders in Tuz Khurmatu expressed alarm.", "entities": ["Peshmerga", "ISF", "Iraqi Turkmen Front"], "verified": True},
            {"id": "evt-009", "title": "Turkmen Properties Seized in Kirkuk as Tensions Escalate", "type": "political", "severity": "critical", "location": "Kirkuk City", "governorate": "Kirkuk", "country": "Iraq", "timestamp": "2026-04-10T08:00:00Z", "source": "Turkmeneli TV", "language": "Arabic", "sentiment": -0.91, "sti_relevant": True, "sti_axes": ["arab-kurd-turkmen", "minority"], "summary": "ITF reports 23 Turkmen-owned properties illegally transferred in systematic demographic engineering.", "entities": ["Iraqi Turkmen Front", "Kirkuk Governorate", "Article 140"], "verified": True},
            {"id": "evt-010", "title": "Shabak Community Protests Militia Presence Near Mosul", "type": "social", "severity": "medium", "location": "Bartella, Nineveh Plains", "governorate": "Nineveh", "country": "Iraq", "timestamp": "2026-04-10T07:15:00Z", "source": "Al Sumaria News", "language": "Arabic", "sentiment": -0.62, "sti_relevant": True, "sti_axes": ["minority"], "summary": "Shabak community demonstrated against PMF Brigade presence in Bartella.", "entities": ["Shabak Community", "PMF 30th Brigade"], "verified": True},
            {"id": "evt-007", "title": "IRGC-Aligned Media Escalates Anti-US Rhetoric", "type": "security", "severity": "high", "location": "Multiple", "governorate": "Baghdad", "country": "Iraq", "timestamp": "2026-04-10T11:00:00Z", "source": "Telegram OSINT", "language": "Arabic", "sentiment": -0.88, "sti_relevant": True, "sti_axes": ["sunni-shia", "intra-shia"], "summary": "Coordinated campaign across 14 IRGC-linked Telegram channels.", "entities": ["IRGC", "Kata'ib Hezbollah"], "verified": False},
        ]

    def _simulated_actors(self) -> List[dict]:
        """Return simulated actors matching data.ts structure."""
        return [
            {"id": "act-001", "name": "Kata'ib Hezbollah", "name_ar": "كتائب حزب الله", "type": "militia", "category": "Iran-aligned PMF", "country": "Iraq", "affiliation": "IRGC/PMF", "description": "Most powerful Iran-aligned armed group. US-designated.", "connections": 47, "risk_level": "critical", "last_active": "2026-04-10"},
            {"id": "act-007", "name": "Iraqi Turkmen Front", "name_ar": "الجبهة التركمانية العراقية", "type": "party", "category": "Turkmen Political Party", "country": "Iraq", "affiliation": "Turkey-aligned", "description": "Primary political representative of Iraq's Turkmen community — third-largest ethnic group.", "connections": 35, "risk_level": "medium", "last_active": "2026-04-10"},
            {"id": "act-008", "name": "Assyrian Democratic Movement", "name_ar": "الحركة الديمقراطية الآشورية", "type": "party", "category": "Assyrian/Christian Political Party", "country": "Iraq", "affiliation": "Independent Christian", "description": "Oldest Assyrian political party. Represents Assyrian, Chaldean, and Syriac communities.", "connections": 18, "risk_level": "low", "last_active": "2026-04-07"},
            {"id": "act-009", "name": "Shabak Community Council", "name_ar": "مجلس مجتمع الشبك", "type": "organization", "category": "Ethno-Religious Community", "country": "Iraq", "affiliation": "Independent Shabak", "description": "Representative body for the Shabak people near Mosul.", "connections": 12, "risk_level": "medium", "last_active": "2026-04-10"},
        ]
