# ═══════════════════════════════════════════════════════════════════
# MERIDIAN — Radio Intercept Scanner Intelligence
# Integrates WebSDR receivers + Broadcastify feeds + scanner databases
# Ported from ShadowBroker's radio_intercept.py
# No API key required — all public data
# ═══════════════════════════════════════════════════════════════════

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
import httpx
import logging
import time
from datetime import datetime, timezone
from typing import Optional

router = APIRouter()
logger = logging.getLogger("meridian.radio")

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


# ── WebSDR Receivers (Public, No Key) ───────────────────────────
WEBSDR_RECEIVERS = [
    {"id": "twente", "name": "University of Twente WebSDR", "url": "http://websdr.ewi.utwente.nl:8901", "lat": 52.24, "lng": 6.85, "country": "Netherlands", "bands": "0-29.1 MHz", "status": "active"},
    {"id": "globaltuners", "name": "GlobalTuners Network", "url": "http://www.globaltuners.com", "lat": 51.50, "lng": -0.13, "country": "UK", "bands": "HF/VHF/UHF", "status": "active"},
    {"id": "hackgreen", "name": "Hack Green Nuclear Bunker SDR", "url": "http://hackgreensdr.org:8901", "lat": 53.02, "lng": -2.52, "country": "UK", "bands": "25-1000 MHz", "status": "active"},
    {"id": "na5b", "name": "NA5B Washington DC", "url": "http://na5b.com:8901", "lat": 38.90, "lng": -77.03, "country": "USA", "bands": "0-30 MHz", "status": "active"},
    {"id": "is0grb", "name": "IS0GRB Sardinia WebSDR", "url": "http://websdr.is0grb.it:8901", "lat": 39.22, "lng": 9.11, "country": "Italy", "bands": "0-30 MHz", "status": "active"},
    {"id": "rx-kiwi", "name": "KiwiSDR Global Interactive Map", "url": "http://rx.kiwisdr.com", "lat": 37.98, "lng": 23.73, "country": "Greece", "bands": "0-30 MHz", "status": "active"},
]

# ── Military/Intelligence Frequencies ───────────────────────────
MIL_FREQUENCIES = [
    # HF - Global military
    {"freq_mhz": 4.724, "mode": "USB", "designation": "NATO MARS", "type": "military", "region": "global"},
    {"freq_mhz": 6.739, "mode": "USB", "designation": "USAF HF-GCS (Mainsail)", "type": "military", "region": "global"},
    {"freq_mhz": 8.992, "mode": "USB", "designation": "USAF HF-GCS Primary", "type": "military", "region": "global"},
    {"freq_mhz": 11.175, "mode": "USB", "designation": "USAF HF-GCS Secondary", "type": "military", "region": "global"},
    {"freq_mhz": 13.200, "mode": "USB", "designation": "USAF HF-GCS Tertiary", "type": "military", "region": "global"},
    {"freq_mhz": 15.016, "mode": "USB", "designation": "USAF HF-GCS", "type": "military", "region": "global"},
    # VHF/UHF - Tactical
    {"freq_mhz": 121.5, "mode": "AM", "designation": "International Distress", "type": "emergency", "region": "global"},
    {"freq_mhz": 243.0, "mode": "AM", "designation": "Military Guard/Emergency", "type": "emergency", "region": "global"},
    {"freq_mhz": 138.025, "mode": "NFM", "designation": "US Army Common", "type": "military", "region": "MENA"},
    {"freq_mhz": 225.0, "mode": "AM", "designation": "UHF Military Air Common", "type": "military", "region": "global"},
    {"freq_mhz": 255.1, "mode": "AM", "designation": "NATO Air Common", "type": "military", "region": "Europe/MENA"},
    {"freq_mhz": 282.8, "mode": "AM", "designation": "NATO Distress", "type": "emergency", "region": "global"},
    {"freq_mhz": 311.0, "mode": "AM", "designation": "USAF Air Refueling Common", "type": "military", "region": "global"},
    {"freq_mhz": 340.2, "mode": "AM", "designation": "Red Flag Air-to-Air", "type": "military", "region": "US"},
    {"freq_mhz": 349.4, "mode": "AM", "designation": "USN Carrier Air Traffic", "type": "military", "region": "global"},
    # SATCOM
    {"freq_mhz": 240.0, "mode": "FM", "designation": "FLTSATCOM Downlink", "type": "satcom", "region": "global"},
    {"freq_mhz": 248.5, "mode": "FM", "designation": "UFO SATCOM", "type": "satcom", "region": "global"},
    # Number Stations (intelligence)
    {"freq_mhz": 4.625, "mode": "AM", "designation": "UVB-76 'The Buzzer'", "type": "numbers", "region": "Russia"},
    {"freq_mhz": 5.473, "mode": "USB", "designation": "Lincolnshire Poacher (historic)", "type": "numbers", "region": "Cyprus/MENA"},
    {"freq_mhz": 6.840, "mode": "AM", "designation": "Chinese Numbers Station", "type": "numbers", "region": "Asia"},
]

# ── Broadcastify Scanner Feeds (Public) ─────────────────────────
SCANNER_FEEDS = [
    {"id": "feed-norfolk", "name": "Norfolk Naval Station", "url": "https://www.broadcastify.com/listen/feed/5700", "lat": 36.95, "lng": -76.33, "type": "military", "region": "US East Coast"},
    {"id": "feed-sandiego", "name": "San Diego Military", "url": "https://www.broadcastify.com/listen/feed/6258", "lat": 32.69, "lng": -117.15, "type": "military", "region": "US West Coast"},
    {"id": "feed-centcom", "name": "CENTCOM AOR Monitor", "url": "https://www.broadcastify.com/listen/ctid/1", "lat": 27.85, "lng": -82.50, "type": "military", "region": "Tampa/CENTCOM"},
    {"id": "feed-bahrain", "name": "5th Fleet Bahrain ATC", "url": "https://www.liveatc.net/listen/obbi", "lat": 26.23, "lng": 50.55, "type": "ATC", "region": "Persian Gulf"},
]


@router.get("/receivers")
async def get_sdr_receivers(
    region: str = Query(default="all", description="Filter: all, mena, europe, global"),
):
    """List available WebSDR receivers near areas of interest."""
    receivers = WEBSDR_RECEIVERS
    if region == "mena":
        receivers = [r for r in receivers if r["country"] in ["Kuwait", "Israel", "Turkey", "Cyprus", "Jordan"]]
    elif region == "europe":
        receivers = [r for r in receivers if r["country"] in ["Netherlands", "UK", "Greece"]]
    
    return JSONResponse(content={
        "receivers": receivers,
        "count": len(receivers),
        "note": "Click URL to listen live — WebSDR is free and requires no authentication",
    })


@router.get("/frequencies")
async def get_monitored_frequencies(
    type: str = Query(default="all", description="Filter: all, military, emergency, satcom, numbers"),
    region: str = Query(default="all"),
):
    """Get database of monitored military/intelligence frequencies."""
    freqs = MIL_FREQUENCIES
    if type != "all":
        freqs = [f for f in freqs if f["type"] == type]
    if region != "all":
        freqs = [f for f in freqs if region.lower() in f["region"].lower() or f["region"] == "global"]
    
    return JSONResponse(content={
        "frequencies": freqs,
        "count": len(freqs),
        "types": list(set(f["type"] for f in MIL_FREQUENCIES)),
    })


@router.get("/scanners")
async def get_scanner_feeds():
    """Get available public scanner/radio feeds."""
    return JSONResponse(content={
        "feeds": SCANNER_FEEDS,
        "count": len(SCANNER_FEEDS),
        "note": "Live audio feeds — click URL to listen",
    })


@router.get("/activity-summary")
async def radio_activity_summary():
    """
    Summary of radio intelligence activity.
    Checks WebSDR receiver availability and provides SIGINT overview.
    """
    client = _get_client()
    online_count = 0
    
    # Quick availability check on a few receivers
    for receiver in WEBSDR_RECEIVERS[:3]:
        try:
            resp = await client.head(receiver["url"], timeout=5.0)
            if resp.status_code < 400:
                online_count += 1
        except Exception:
            pass
    
    return JSONResponse(content={
        "receivers_total": len(WEBSDR_RECEIVERS),
        "receivers_checked": min(3, len(WEBSDR_RECEIVERS)),
        "receivers_online": online_count,
        "monitored_frequencies": len(MIL_FREQUENCIES),
        "frequency_types": {
            "military": len([f for f in MIL_FREQUENCIES if f["type"] == "military"]),
            "emergency": len([f for f in MIL_FREQUENCIES if f["type"] == "emergency"]),
            "satcom": len([f for f in MIL_FREQUENCIES if f["type"] == "satcom"]),
            "numbers_stations": len([f for f in MIL_FREQUENCIES if f["type"] == "numbers"]),
        },
        "scanner_feeds": len(SCANNER_FEEDS),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })
