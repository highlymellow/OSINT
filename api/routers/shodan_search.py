# ═══════════════════════════════════════════════════════════════════
# MERIDIAN — Shodan IoT/Infrastructure Search
# Searches for exposed devices, industrial control systems, webcams
# Ported from ShadowBroker's shodan_connector.py
# Requires SHODAN_API_KEY env var (free tier: 100 queries/month)
# ═══════════════════════════════════════════════════════════════════

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
import httpx
import logging
import time
from datetime import datetime, timezone
from typing import Optional
import os

router = APIRouter()
logger = logging.getLogger("meridian.shodan")

_client: Optional[httpx.AsyncClient] = None
_shodan_cache: dict = {}
_shodan_cache_ts: float = 0
SHODAN_CACHE_TTL = 600  # 10 min cache (Shodan rate limits are tight)

# Use provided key or fallback to environment/settings
SHODAN_API_KEY = "swMiGefggmlfjl90O9XPrmWxm4hvJiF6"

def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            timeout=httpx.Timeout(30.0, connect=10.0),
            follow_redirects=True,
        )
    return _client


# ── Pre-built Shodan Queries for OSINT ──────────────────────────
OSINT_QUERIES = {
    "scada_ics": {
        "query": 'port:502 country:"IQ"',
        "label": "SCADA/ICS Systems (Modbus)",
        "risk": "critical",
        "description": "Industrial control systems exposed on the internet via Modbus protocol",
    },
    "webcams": {
        "query": 'has_screenshot:true country:"IQ"',
        "label": "Exposed Webcams",
        "risk": "high",
        "description": "Internet-facing cameras with screenshots available",
    },
    "databases": {
        "query": 'port:27017 country:"IQ"',
        "label": "Exposed MongoDB",
        "risk": "critical",
        "description": "MongoDB instances without authentication exposed to internet",
    },
    "rdp_exposed": {
        "query": 'port:3389 country:"IQ"',
        "label": "Exposed RDP",
        "risk": "high",
        "description": "Remote Desktop Protocol endpoints visible from internet",
    },
    "oil_infrastructure": {
        "query": '"Schneider Electric" OR "Siemens" OR "ABB" country:"IQ"',
        "label": "Oil/Energy SCADA",
        "risk": "critical",
        "description": "Industrial automation systems from major SCADA vendors in Iraq",
    },
    "government_infra": {
        "query": 'org:"Ministry" country:"IQ"',
        "label": "Government Infrastructure",
        "risk": "high",
        "description": "Government-associated network infrastructure",
    },
    "vpn_endpoints": {
        "query": 'port:1194 OR port:443 "OpenVPN" country:"IQ"',
        "label": "VPN Endpoints",
        "risk": "medium",
        "description": "OpenVPN and SSL VPN concentrators",
    },
    "telnet_devices": {
        "query": 'port:23 country:"IQ"',
        "label": "Telnet (Legacy)",
        "risk": "high",
        "description": "Devices still running insecure Telnet protocol",
    },
}


@router.get("/search")
async def shodan_search(
    query: str = Query(default='port:502 country:"IQ"', description="Shodan search query"),
    page: int = Query(default=1, ge=1, le=10),
):
    """
    Search Shodan for exposed devices/infrastructure.
    Requires SHODAN_API_KEY environment variable.
    Free tier: 100 queries/month, returns limited results.
    """
    if not SHODAN_API_KEY:
        return JSONResponse(content={
            "error": "SHODAN_API_KEY not configured",
            "message": "Set SHODAN_API_KEY in your .env file. Free tier at https://shodan.io",
            "demo_data": _get_demo_results(query),
        })
    
    cache_key = f"{query}_{page}"
    if time.time() - _shodan_cache_ts < SHODAN_CACHE_TTL and cache_key in _shodan_cache:
        return JSONResponse(content=_shodan_cache[cache_key])
    
    client = _get_client()
    try:
        resp = await client.get(
            "https://api.shodan.io/shodan/host/search",
            params={"key": SHODAN_API_KEY, "query": query, "page": page},
        )
        
        if resp.status_code == 401:
            raise HTTPException(status_code=401, detail="Invalid Shodan API key")
        if resp.status_code == 429:
            raise HTTPException(status_code=429, detail="Shodan rate limit exceeded")
        
        resp.raise_for_status()
        data = resp.json()
        
        results = []
        for match in data.get("matches", []):
            results.append({
                "ip": match.get("ip_str", ""),
                "port": match.get("port", 0),
                "org": match.get("org", "Unknown"),
                "isp": match.get("isp", ""),
                "os": match.get("os"),
                "country": match.get("location", {}).get("country_name", ""),
                "city": match.get("location", {}).get("city", ""),
                "lat": match.get("location", {}).get("latitude"),
                "lng": match.get("location", {}).get("longitude"),
                "product": match.get("product", ""),
                "version": match.get("version", ""),
                "hostnames": match.get("hostnames", []),
                "has_screenshot": "screenshot" in match.get("opts", {}),
                "vulns": list(match.get("vulns", {}).keys())[:5] if match.get("vulns") else [],
            })
        
        result = {
            "results": results,
            "total": data.get("total", 0),
            "query": query,
            "page": page,
            "source": "shodan_live",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        
        _shodan_cache[cache_key] = result
        _shodan_cache_ts = time.time()
        return JSONResponse(content=result)
        
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Shodan error: {e}")
    except Exception as e:
        logger.error(f"Shodan search failed: {e}")
        return JSONResponse(content={
            "error": str(e),
            "demo_data": _get_demo_results(query),
        })


@router.get("/queries")
async def get_preset_queries():
    """Get pre-built OSINT queries for common infrastructure searches."""
    return JSONResponse(content={
        "queries": OSINT_QUERIES,
        "api_key_configured": bool(SHODAN_API_KEY),
        "note": "Use these queries with the /search endpoint, or browse at shodan.io",
    })


@router.get("/stats")
async def get_country_stats(
    country: str = Query(default="IQ", description="ISO 2-letter country code"),
):
    """Get Shodan statistics for a country (if API key configured)."""
    if not SHODAN_API_KEY:
        return JSONResponse(content=_get_demo_stats(country))
    
    client = _get_client()
    try:
        resp = await client.get(
            "https://api.shodan.io/shodan/host/count",
            params={"key": SHODAN_API_KEY, "query": f'country:"{country}"', "facets": "port,org,os"},
        )
        if resp.status_code == 200:
            return JSONResponse(content=resp.json())
    except Exception as e:
        logger.error(f"Shodan stats failed: {e}")
    
    return JSONResponse(content=_get_demo_stats(country))


def _get_demo_results(query: str) -> dict:
    """Return demo results when no API key is configured."""
    return {
        "results": [
            {"ip": "203.0.113.x", "port": 502, "org": "Demo ISP", "country": "Iraq", "city": "Baghdad",
             "lat": 33.3, "lng": 44.4, "product": "Modbus/TCP", "vulns": [], "note": "DEMO DATA — Set SHODAN_API_KEY for live results"},
            {"ip": "198.51.100.x", "port": 80, "org": "Demo Hosting", "country": "Iraq", "city": "Erbil",
             "lat": 36.19, "lng": 44.01, "product": "nginx", "vulns": [], "note": "DEMO DATA"},
        ],
        "total": 2,
        "query": query,
        "source": "demo",
    }


def _get_demo_stats(country: str) -> dict:
    """Return demo stats when no API key is configured."""
    return {
        "total": 0,
        "country": country,
        "facets": {"port": [], "org": [], "os": []},
        "source": "demo",
        "note": "Set SHODAN_API_KEY for live infrastructure data",
    }


@router.get("/api-info")
async def get_shodan_api_info():
    """
    Returns information about the API plan belonging to the given API key.
    """
    if not SHODAN_API_KEY:
        return JSONResponse(status_code=400, content={"error": "SHODAN_API_KEY not configured"})
        
    client = _get_client()
    try:
        resp = await client.get(
            "https://api.shodan.io/api-info",
            params={"key": SHODAN_API_KEY}
        )
        
        if resp.status_code != 200:
            error_msg = resp.json().get("error", "Unknown error")
            return JSONResponse(status_code=resp.status_code, content={"error": error_msg})
            
        return JSONResponse(content=resp.json())
        
    except httpx.HTTPError as e:
        logger.error(f"Failed to fetch Shodan API info: {e}")
        return JSONResponse(status_code=500, content={"error": f"Failed to connect to Shodan: {e}"})
