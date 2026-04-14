# ═══════════════════════════════════════════════════════════════════
# MERIDIAN — CCTV Mesh / Camera Intelligence Pipeline
# Aggregates public traffic cameras, DOT feeds, and webcam directories
# Ported from ShadowBroker's cctv_pipeline.py
# Uses only publicly accessible camera feeds — no hacking/exploitation
# ═══════════════════════════════════════════════════════════════════

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
import httpx
import logging
import time
from datetime import datetime, timezone
from typing import Optional

router = APIRouter()
logger = logging.getLogger("meridian.cctv")

_client: Optional[httpx.AsyncClient] = None

def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            timeout=httpx.Timeout(15.0, connect=10.0),
            follow_redirects=True,
            headers={"User-Agent": "MERIDIAN-OSINT/2.0"},
        )
    return _client


# ── Public Camera Registries ────────────────────────────────────
# These are government/DOT/public webcams — legally accessible

CAMERA_SOURCES = {
    "mena": {
        "label": "MENA Region Public Cams",
        "cameras": [
            {"id": "cam-baghdad-01", "name": "Baghdad Green Zone Traffic", "lat": 33.30, "lng": 44.38, "type": "traffic", "country": "Iraq", "status": "active", "url": "https://www.windy.com/-Webcams/Iraq"},
            {"id": "cam-erbil-01", "name": "Erbil Citadel Area", "lat": 36.19, "lng": 44.01, "type": "tourism", "country": "Iraq", "status": "active", "url": "https://www.windy.com/-Webcams/Iraq"},
            {"id": "cam-basra-01", "name": "Basra Port Approach", "lat": 30.51, "lng": 47.78, "type": "port", "country": "Iraq", "status": "active", "url": "https://www.windy.com/-Webcams/Iraq"},
            {"id": "cam-dubai-01", "name": "Dubai Marina", "lat": 25.08, "lng": 55.14, "type": "city", "country": "UAE", "status": "active", "url": "https://www.skylinewebcams.com/en/webcam/united-arab-emirates.html"},
            {"id": "cam-istanbul-01", "name": "Istanbul Bosphorus", "lat": 41.04, "lng": 29.00, "type": "maritime", "country": "Turkey", "status": "active", "url": "https://www.skylinewebcams.com/en/webcam/turkiye.html"},
            {"id": "cam-haifa-01", "name": "Haifa Port", "lat": 32.82, "lng": 34.98, "type": "port", "country": "Israel", "status": "active", "url": "https://www.skylinewebcams.com/en/webcam/israel.html"},
            {"id": "cam-amman-01", "name": "Amman Downtown", "lat": 31.95, "lng": 35.93, "type": "city", "country": "Jordan", "status": "active", "url": "https://www.windy.com/-Webcams/Jordan"},
            {"id": "cam-beirut-01", "name": "Beirut Corniche", "lat": 33.89, "lng": 35.49, "type": "city", "country": "Lebanon", "status": "active", "url": "https://www.skylinewebcams.com/en/webcam/lebanon.html"},
            {"id": "cam-cairo-01", "name": "Cairo Nile View", "lat": 30.04, "lng": 31.24, "type": "city", "country": "Egypt", "status": "active", "url": "https://www.skylinewebcams.com/en/webcam/egypt.html"},
            {"id": "cam-doha-01", "name": "Doha Corniche", "lat": 25.29, "lng": 51.53, "type": "city", "country": "Qatar", "status": "active", "url": "https://www.windy.com/-Webcams/Qatar"},
        ]
    },
    "ports": {
        "label": "Global Port Monitoring",
        "cameras": [
            {"id": "cam-hormuz-01", "name": "Strait of Hormuz Approach", "lat": 26.56, "lng": 56.25, "type": "maritime", "country": "Oman", "status": "monitoring", "url": "https://www.marinetraffic.com"},
            {"id": "cam-suez-01", "name": "Suez Canal North", "lat": 31.27, "lng": 32.31, "type": "maritime", "country": "Egypt", "status": "active", "url": "https://www.marinetraffic.com"},
            {"id": "cam-bab-01", "name": "Bab el-Mandeb Strait", "lat": 12.58, "lng": 43.33, "type": "maritime", "country": "Yemen/Djibouti", "status": "monitoring", "url": "https://www.marinetraffic.com"},
            {"id": "cam-singapore-01", "name": "Singapore Strait", "lat": 1.27, "lng": 103.80, "type": "maritime", "country": "Singapore", "status": "active", "url": "https://www.marinetraffic.com"},
        ]
    },
    "military": {
        "label": "Military Base Perimeter (Public)",
        "cameras": [
            {"id": "cam-incirlik-01", "name": "Incirlik AB Perimeter", "lat": 36.99, "lng": 35.33, "type": "military", "country": "Turkey", "status": "restricted", "url": None},
            {"id": "cam-diegogarcia-01", "name": "Diego Garcia", "lat": -7.32, "lng": 72.42, "type": "military", "country": "BIOT", "status": "restricted", "url": None},
            {"id": "cam-aldhafra-01", "name": "Al Dhafra AB Area", "lat": 24.25, "lng": 54.55, "type": "military", "country": "UAE", "status": "restricted", "url": None},
            {"id": "cam-aludeid-01", "name": "Al Udeid AB Area", "lat": 25.12, "lng": 51.31, "type": "military", "country": "Qatar", "status": "restricted", "url": None},
        ]
    },
    "traffic": {
        "label": "Global Traffic Cameras (DOT)",
        "cameras": [
            {"id": "cam-usdot-01", "name": "USDOT 511 Network", "lat": 38.9, "lng": -77.04, "type": "traffic", "country": "USA", "status": "api_available", "url": "https://www.511.org"},
        ]
    }
}


@router.get("/cameras")
async def get_camera_registry(
    region: str = Query(default="all", description="Region: all, mena, ports, military, traffic"),
    type: str = Query(default="all", description="Type: all, traffic, maritime, city, port, military, tourism"),
    country: str = Query(default="all", description="Country filter"),
):
    """
    Get registry of publicly accessible camera feeds.
    All cameras are legally/publicly accessible — no exploitation.
    """
    all_cameras = []
    sources = CAMERA_SOURCES if region == "all" else {region: CAMERA_SOURCES.get(region, {})}
    
    for src_key, src_data in sources.items():
        if not src_data:
            continue
        for cam in src_data.get("cameras", []):
            if type != "all" and cam["type"] != type:
                continue
            if country != "all" and cam["country"].lower() != country.lower():
                continue
            all_cameras.append({**cam, "source_group": src_key})
    
    return JSONResponse(content={
        "cameras": all_cameras,
        "count": len(all_cameras),
        "groups": {k: v["label"] for k, v in CAMERA_SOURCES.items()},
        "note": "All feeds are publicly accessible. No exploitation or unauthorized access.",
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })


@router.get("/coverage")
async def get_coverage_summary():
    """Get CCTV coverage summary by region and type."""
    summary = {}
    total = 0
    
    for src_key, src_data in CAMERA_SOURCES.items():
        cameras = src_data.get("cameras", [])
        total += len(cameras)
        type_counts = {}
        country_counts = {}
        for cam in cameras:
            type_counts[cam["type"]] = type_counts.get(cam["type"], 0) + 1
            country_counts[cam["country"]] = country_counts.get(cam["country"], 0) + 1
        
        summary[src_key] = {
            "label": src_data["label"],
            "total": len(cameras),
            "active": len([c for c in cameras if c["status"] == "active"]),
            "types": type_counts,
            "countries": country_counts,
        }
    
    return JSONResponse(content={
        "coverage": summary,
        "total_cameras": total,
        "regions": len(CAMERA_SOURCES),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })


@router.get("/windy-cams")
async def get_windy_webcams(
    lat: float = Query(default=33.3),
    lng: float = Query(default=44.4),
    radius: int = Query(default=250, description="Radius in km"),
):
    """
    Fetch nearby webcams from Windy.com public API.
    Free public endpoint — no API key required.
    """
    client = _get_client()
    try:
        url = f"https://api.windy.com/webcams/api/v3/webcams?nearby={lat},{lng},{radius}&limit=50"
        resp = await client.get(url, headers={"Accept": "application/json"})
        
        if resp.status_code == 200:
            data = resp.json()
            cams = []
            for cam in data.get("webcams", []):
                cams.append({
                    "id": cam.get("webcamId", ""),
                    "name": cam.get("title", "Unknown"),
                    "lat": cam.get("location", {}).get("latitude"),
                    "lng": cam.get("location", {}).get("longitude"),
                    "country": cam.get("location", {}).get("country"),
                    "city": cam.get("location", {}).get("city"),
                    "status": cam.get("status"),
                    "url": cam.get("urls", {}).get("detail"),
                    "image_url": cam.get("images", {}).get("current", {}).get("preview"),
                })
            return JSONResponse(content={"cameras": cams, "count": len(cams), "source": "windy"})
    except Exception as e:
        logger.debug(f"Windy webcam API failed: {e}")
    
    # Fallback to registry
    return JSONResponse(content={
        "cameras": CAMERA_SOURCES["mena"]["cameras"],
        "count": len(CAMERA_SOURCES["mena"]["cameras"]),
        "source": "local_registry",
    })
