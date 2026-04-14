# ═══════════════════════════════════════════════════════════════════
# MERIDIAN — Cross-Domain Intelligence Correlation Engine
# Links events across feeds: news ↔ seismic ↔ military ↔ maritime
# Inspired by ShadowBroker's correlation_engine.py
# ═══════════════════════════════════════════════════════════════════

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
import httpx
import logging
import time
import math
import re
from datetime import datetime, timezone, timedelta
from typing import Optional

router = APIRouter()
logger = logging.getLogger("meridian.correlation")

# ── Shared HTTP client ──────────────────────────────────────────
_client: Optional[httpx.AsyncClient] = None

def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            timeout=httpx.Timeout(30.0, connect=10.0),
            follow_redirects=True,
            headers={"User-Agent": "MERIDIAN-OSINT/2.0"},
        )
    return _client


# ── Correlation cache ───────────────────────────────────────────
_correlation_cache: dict = {}
_correlation_cache_ts: float = 0
CORRELATION_CACHE_TTL = 600  # 10 minutes


# ── Geographic constants ────────────────────────────────────────
MENA_COUNTRIES = {
    "Iraq": {"lat": 33.22, "lng": 43.68, "code": "IQ"},
    "Syria": {"lat": 34.80, "lng": 38.99, "code": "SY"},
    "Iran": {"lat": 32.43, "lng": 53.69, "code": "IR"},
    "Turkey": {"lat": 38.96, "lng": 35.24, "code": "TR"},
    "Saudi Arabia": {"lat": 23.89, "lng": 45.08, "code": "SA"},
    "Yemen": {"lat": 15.55, "lng": 48.52, "code": "YE"},
    "Lebanon": {"lat": 33.85, "lng": 35.86, "code": "LB"},
    "Jordan": {"lat": 30.59, "lng": 36.24, "code": "JO"},
    "Israel": {"lat": 31.05, "lng": 34.85, "code": "IL"},
    "Palestine": {"lat": 31.95, "lng": 35.23, "code": "PS"},
    "Egypt": {"lat": 26.82, "lng": 30.80, "code": "EG"},
    "Libya": {"lat": 26.34, "lng": 17.23, "code": "LY"},
    "Kuwait": {"lat": 29.31, "lng": 47.48, "code": "KW"},
    "UAE": {"lat": 23.42, "lng": 53.85, "code": "AE"},
    "Bahrain": {"lat": 26.07, "lng": 50.55, "code": "BH"},
    "Qatar": {"lat": 25.35, "lng": 51.18, "code": "QA"},
    "Oman": {"lat": 21.47, "lng": 55.98, "code": "OM"},
    "Afghanistan": {"lat": 33.94, "lng": 67.71, "code": "AF"},
    "Pakistan": {"lat": 30.38, "lng": 69.35, "code": "PK"},
    "Somalia": {"lat": 5.15, "lng": 46.20, "code": "SO"},
    "Sudan": {"lat": 12.86, "lng": 30.22, "code": "SD"},
}

# Event categories for cross-domain correlation
EVENT_DOMAINS = {
    "conflict": ["attack", "strike", "bomb", "militia", "military", "kill", "shoot", "drone", "airstrike"],
    "political": ["election", "parliament", "president", "government", "vote", "coup", "resign", "protest"],
    "humanitarian": ["refugee", "displaced", "aid", "famine", "crisis", "UN", "UNHCR", "food"],
    "economic": ["oil", "trade", "sanction", "economy", "inflation", "currency", "bank"],
    "seismic": ["earthquake", "tremor", "magnitude", "richter", "seismic", "aftershock"],
    "environmental": ["flood", "drought", "wildfire", "fire", "storm", "cyclone", "heat"],
    "maritime": ["ship", "vessel", "navy", "carrier", "maritime", "strait", "blockade", "piracy"],
    "cyber": ["cyber", "hack", "breach", "ransomware", "infrastructure", "grid"],
}


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two points in km."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _classify_event(text: str) -> list:
    """Classify text into event domains."""
    text_lower = text.lower()
    domains = []
    for domain, keywords in EVENT_DOMAINS.items():
        if any(kw in text_lower for kw in keywords):
            domains.append(domain)
    return domains or ["general"]


def _extract_country(text: str) -> Optional[dict]:
    """Extract country reference from text."""
    text_lower = text.lower()
    for country, data in MENA_COUNTRIES.items():
        if country.lower() in text_lower:
            return {"name": country, **data}
    return None


def _calculate_correlation_score(event_a: dict, event_b: dict) -> float:
    """
    Calculate a correlation score between two events based on:
    - Temporal proximity (same day = high)
    - Geographic proximity (same country/region = high)
    - Domain overlap (conflict + maritime = interesting)
    - Keyword overlap (shared entities)
    """
    score = 0.0
    
    # Temporal proximity (0-0.3)
    try:
        t1 = datetime.fromisoformat(event_a.get("timestamp", "").replace("Z", "+00:00"))
        t2 = datetime.fromisoformat(event_b.get("timestamp", "").replace("Z", "+00:00"))
        hours_apart = abs((t1 - t2).total_seconds()) / 3600
        if hours_apart < 6:
            score += 0.3
        elif hours_apart < 24:
            score += 0.2
        elif hours_apart < 72:
            score += 0.1
    except (ValueError, TypeError):
        score += 0.05  # Unknown times still get some score
    
    # Geographic proximity (0-0.3)
    geo_a = event_a.get("geo")
    geo_b = event_b.get("geo")
    if geo_a and geo_b:
        dist = _haversine_km(geo_a["lat"], geo_a["lng"], geo_b["lat"], geo_b["lng"])
        if dist < 100:
            score += 0.3
        elif dist < 500:
            score += 0.2
        elif dist < 1000:
            score += 0.1
    elif event_a.get("country") == event_b.get("country") and event_a.get("country"):
        score += 0.15
    
    # Domain cross-correlation (0-0.25)
    domains_a = set(event_a.get("domains", []))
    domains_b = set(event_b.get("domains", []))
    cross_domain = domains_a != domains_b and domains_a & domains_b
    if cross_domain:
        score += 0.25  # Cross-domain but overlapping = intelligence gold
    elif domains_a & domains_b:
        score += 0.1
    
    # Interesting domain pairs (bonus 0-0.15)
    interesting_pairs = [
        ({"conflict"}, {"maritime"}),
        ({"conflict"}, {"seismic"}),
        ({"political"}, {"economic"}),
        ({"humanitarian"}, {"conflict"}),
        ({"cyber"}, {"conflict"}),
        ({"environmental"}, {"humanitarian"}),
    ]
    for pair_a, pair_b in interesting_pairs:
        if (domains_a & pair_a and domains_b & pair_b) or (domains_a & pair_b and domains_b & pair_a):
            score += 0.15
            break
    
    return min(score, 1.0)


@router.get("/analyze")
async def analyze_correlations(
    region: str = Query(default="iraq", description="Focus region for correlation"),
    hours: int = Query(default=72, ge=1, le=168, description="Time window in hours"),
    min_score: float = Query(default=0.4, ge=0.0, le=1.0, description="Minimum correlation score"),
):
    """
    Run cross-domain correlation analysis on recent intelligence events.
    Pulls from GDELT, USGS, ReliefWeb RSS, and GDACS to find correlated events.
    """
    global _correlation_cache, _correlation_cache_ts
    
    cache_key = f"{region}_{hours}_{min_score}"
    if time.time() - _correlation_cache_ts < CORRELATION_CACHE_TTL and cache_key in _correlation_cache:
        return JSONResponse(content=_correlation_cache[cache_key])
    
    start = time.time()
    client = _get_client()
    events = []
    
    # ── Source 1: GDELT events ──────────────────────────────────
    try:
        gdelt_url = (
            f"https://api.gdeltproject.org/api/v2/doc/doc"
            f"?query={region}&mode=artlist&maxrecords=50"
            f"&format=json&sort=datedesc&timespan={hours}h"
        )
        resp = await client.get(gdelt_url)
        if resp.status_code == 200:
            data = resp.json()
            for art in data.get("articles", [])[:30]:
                title = art.get("title", "")
                country = _extract_country(title)
                events.append({
                    "id": f"gdelt-{hash(title) % 100000}",
                    "title": title,
                    "source": "GDELT",
                    "source_type": "news",
                    "timestamp": art.get("seendate", ""),
                    "domains": _classify_event(title),
                    "country": country["name"] if country else region.title(),
                    "geo": {"lat": country["lat"], "lng": country["lng"]} if country else None,
                    "url": art.get("url", ""),
                })
    except Exception as e:
        logger.debug(f"GDELT correlation fetch: {e}")
    
    # ── Source 2: USGS earthquakes ──────────────────────────────
    try:
        usgs_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
        resp = await client.get(usgs_url)
        if resp.status_code == 200:
            data = resp.json()
            for feat in data.get("features", [])[:50]:
                props = feat.get("properties", {})
                coords = feat.get("geometry", {}).get("coordinates", [0, 0, 0])
                lng, lat = coords[0], coords[1]
                title = props.get("title", f"M{props.get('mag', '?')} Earthquake")
                events.append({
                    "id": f"usgs-{feat.get('id', '')}",
                    "title": title,
                    "source": "USGS",
                    "source_type": "seismic",
                    "timestamp": datetime.fromtimestamp(
                        props.get("time", 0) / 1000, tz=timezone.utc
                    ).isoformat(),
                    "domains": ["seismic"],
                    "country": _extract_country(props.get("place", ""))["name"] if _extract_country(props.get("place", "")) else "Unknown",
                    "geo": {"lat": lat, "lng": lng},
                    "magnitude": props.get("mag", 0),
                    "url": props.get("url", ""),
                })
    except Exception as e:
        logger.debug(f"USGS correlation fetch: {e}")
    
    # ── Source 3: GDACS disaster alerts ─────────────────────────
    try:
        gdacs_url = "https://www.gdacs.org/xml/rss.xml"
        resp = await client.get(gdacs_url)
        if resp.status_code == 200:
            import re as regex
            items = regex.findall(r"<item>(.*?)</item>", resp.text, regex.DOTALL)
            for item in items[:30]:
                title_match = regex.search(r"<title>(.*?)</title>", item)
                date_match = regex.search(r"<pubDate>(.*?)</pubDate>", item)
                lat_match = regex.search(r"<geo:lat>(.*?)</geo:lat>", item)
                lng_match = regex.search(r"<geo:long>(.*?)</geo:long>", item)
                
                if title_match:
                    title = title_match.group(1)
                    events.append({
                        "id": f"gdacs-{hash(title) % 100000}",
                        "title": title,
                        "source": "GDACS",
                        "source_type": "disaster",
                        "timestamp": date_match.group(1) if date_match else "",
                        "domains": _classify_event(title),
                        "country": _extract_country(title)["name"] if _extract_country(title) else "Global",
                        "geo": {
                            "lat": float(lat_match.group(1)),
                            "lng": float(lng_match.group(1)),
                        } if lat_match and lng_match else None,
                        "url": "",
                    })
    except Exception as e:
        logger.debug(f"GDACS correlation fetch: {e}")
    
    # ── Source 4: ReliefWeb RSS ──────────────────────────────────
    try:
        rw_url = f"https://reliefweb.int/updates/rss.xml?search={region}&limit=20"
        resp = await client.get(rw_url)
        if resp.status_code == 200:
            import re as regex
            items = regex.findall(r"<item>(.*?)</item>", resp.text, regex.DOTALL)
            for item in items[:20]:
                title_match = regex.search(r"<title>(.*?)</title>", item)
                date_match = regex.search(r"<pubDate>(.*?)</pubDate>", item)
                
                if title_match:
                    title = title_match.group(1)
                    country = _extract_country(title)
                    events.append({
                        "id": f"rw-{hash(title) % 100000}",
                        "title": title,
                        "source": "ReliefWeb",
                        "source_type": "humanitarian",
                        "timestamp": date_match.group(1) if date_match else "",
                        "domains": _classify_event(title),
                        "country": country["name"] if country else region.title(),
                        "geo": {"lat": country["lat"], "lng": country["lng"]} if country else None,
                        "url": "",
                    })
    except Exception as e:
        logger.debug(f"ReliefWeb correlation fetch: {e}")
    
    # ── Run cross-correlation ──────────────────────────────────
    correlations = []
    for i, event_a in enumerate(events):
        for j, event_b in enumerate(events):
            if j <= i:
                continue
            if event_a["source"] == event_b["source"]:
                continue  # Skip same-source correlations
            
            score = _calculate_correlation_score(event_a, event_b)
            if score >= min_score:
                correlations.append({
                    "id": f"corr-{i}-{j}",
                    "score": round(score, 3),
                    "event_a": {
                        "id": event_a["id"],
                        "title": event_a["title"][:120],
                        "source": event_a["source"],
                        "domains": event_a["domains"],
                        "country": event_a["country"],
                    },
                    "event_b": {
                        "id": event_b["id"],
                        "title": event_b["title"][:120],
                        "source": event_b["source"],
                        "domains": event_b["domains"],
                        "country": event_b["country"],
                    },
                    "correlation_type": _describe_correlation(event_a, event_b),
                    "intelligence_value": _assess_intel_value(score, event_a, event_b),
                })
    
    # Sort by score (highest first)
    correlations.sort(key=lambda c: c["score"], reverse=True)
    
    # Build domain summary
    domain_counts = {}
    for evt in events:
        for d in evt.get("domains", []):
            domain_counts[d] = domain_counts.get(d, 0) + 1
    
    result = {
        "correlations": correlations[:50],  # Top 50
        "total_correlations": len(correlations),
        "events_analyzed": len(events),
        "sources": {
            "gdelt": len([e for e in events if e["source"] == "GDELT"]),
            "usgs": len([e for e in events if e["source"] == "USGS"]),
            "gdacs": len([e for e in events if e["source"] == "GDACS"]),
            "reliefweb": len([e for e in events if e["source"] == "ReliefWeb"]),
        },
        "domain_distribution": domain_counts,
        "region": region,
        "time_window_hours": hours,
        "min_score": min_score,
        "computed_at": datetime.now(timezone.utc).isoformat(),
        "duration_ms": round((time.time() - start) * 1000),
    }
    
    _correlation_cache[cache_key] = result
    _correlation_cache_ts = time.time()
    
    return JSONResponse(content=result)


def _describe_correlation(a: dict, b: dict) -> str:
    """Generate human-readable correlation description."""
    src_a = a["source"]
    src_b = b["source"]
    dom_a = ", ".join(a.get("domains", ["unknown"]))
    dom_b = ", ".join(b.get("domains", ["unknown"]))
    return f"{src_a} ({dom_a}) ↔ {src_b} ({dom_b})"


def _assess_intel_value(score: float, a: dict, b: dict) -> str:
    """Assess the intelligence value of a correlation."""
    domains_a = set(a.get("domains", []))
    domains_b = set(b.get("domains", []))
    
    # Cross-domain correlations are more valuable
    if domains_a != domains_b:
        if score > 0.7:
            return "CRITICAL — Cross-domain temporal+spatial convergence"
        elif score > 0.5:
            return "HIGH — Cross-domain event linking detected"
        else:
            return "MEDIUM — Possible cross-domain relationship"
    
    if score > 0.6:
        return "NOTABLE — Strong same-domain correlation"
    return "LOW — Weak correlation, may be coincidental"


@router.get("/summary")
async def correlation_summary(
    region: str = Query(default="iraq"),
):
    """Quick summary of current correlation intelligence for a region."""
    client = _get_client()
    
    summary = {
        "region": region,
        "threat_domains": [],
        "active_correlations": 0,
        "top_finding": "No significant cross-domain correlations detected",
        "data_freshness": "real-time",
    }
    
    # Quick check of active event counts
    try:
        # ReliefWeb humanitarian
        rw_resp = await client.get(f"https://reliefweb.int/updates/rss.xml?search={region}&limit=5")
        rw_count = rw_resp.text.count("<item>") if rw_resp.status_code == 200 else 0
        
        # USGS seismic
        usgs_resp = await client.get("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson")
        usgs_count = len(usgs_resp.json().get("features", [])) if usgs_resp.status_code == 200 else 0
        
        if rw_count > 10:
            summary["threat_domains"].append("humanitarian")
        if usgs_count > 3:
            summary["threat_domains"].append("seismic")
        
        summary["active_correlations"] = min(rw_count + usgs_count, 25)
        
        if rw_count > 10 and usgs_count > 0:
            summary["top_finding"] = f"Active humanitarian reporting ({rw_count} reports) coincides with seismic activity ({usgs_count} events)"
        elif rw_count > 10:
            summary["top_finding"] = f"Elevated humanitarian reporting detected: {rw_count} recent reports for {region}"
        
    except Exception as e:
        logger.debug(f"Summary check failed: {e}")
    
    summary["computed_at"] = datetime.now(timezone.utc).isoformat()
    return JSONResponse(content=summary)
