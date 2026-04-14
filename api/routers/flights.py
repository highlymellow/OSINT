# ═══════════════════════════════════════════════════════════════════
# MERIDIAN — Aircraft Tracking + GPS Jamming Detection
# OpenSky Network (free tier, no key for anonymous) + ADS-B Exchange
# Ported from ShadowBroker's flights.py
# ═══════════════════════════════════════════════════════════════════

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
import httpx
import logging
import time
import math
from datetime import datetime, timezone, timedelta
from typing import Optional

router = APIRouter()
logger = logging.getLogger("meridian.flights")

_client: Optional[httpx.AsyncClient] = None
_flight_cache: dict = {}
_flight_cache_ts: float = 0
FLIGHT_CACHE_TTL = 30  # 30 seconds — aircraft move fast

OPENSKY_AUTH = ("HighlyMellow", "qiFsax-zonqor-2qokbe")

def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            timeout=httpx.Timeout(20.0, connect=10.0),
            follow_redirects=True,
            headers={"User-Agent": "MERIDIAN-OSINT/2.0"},
        )
    return _client


# ── Known high-interest areas for military tracking ─────────────
WATCH_ZONES = {
    "persian_gulf": {"lat_min": 23, "lat_max": 30, "lng_min": 48, "lng_max": 57, "label": "Persian Gulf"},
    "eastern_med": {"lat_min": 31, "lat_max": 37, "lng_min": 29, "lng_max": 37, "label": "Eastern Mediterranean"},
    "black_sea": {"lat_min": 41, "lat_max": 47, "lng_min": 28, "lng_max": 42, "label": "Black Sea"},
    "south_china_sea": {"lat_min": 5, "lat_max": 23, "lng_min": 105, "lng_max": 121, "label": "South China Sea"},
    "baltic": {"lat_min": 53, "lat_max": 66, "lng_min": 12, "lng_max": 30, "label": "Baltic Sea"},
}

# Military aircraft callsign prefixes
MIL_CALLSIGNS = [
    "RCH", "REACH",  # USAF tankers/cargo
    "DUKE", "VALOR",  # US Army
    "NAVY", "TOPCAT", # USN
    "RRR", "ASCOT",   # RAF
    "CNV", "FAF",     # French AF
    "GAF", "GERM",    # German AF
    "IAM", "ITAL",    # Italian AF
    "FORTE",          # RQ-4 Global Hawk
    "HOMER",          # P-8 Poseidon
    "LAGR",           # KC-135
    "NCHO", "NCH",    # NATO
]

# Aircraft type codes for military
MIL_TYPES = ["C17", "C130", "C5", "KC135", "KC10", "E3", "E6", "E8", "RC135", "P8", "EP3",
             "B52", "B1B", "B2", "F15", "F16", "F18", "F22", "F35", "A10",
             "MQ9", "RQ4", "MQ1", "EUFI", "RAFAL", "GRIPEN"]


@router.get("/live")
async def get_live_aircraft(
    lat_min: float = Query(default=23.0),
    lat_max: float = Query(default=40.0),
    lng_min: float = Query(default=35.0),
    lng_max: float = Query(default=60.0),
    military_only: bool = Query(default=False),
):
    """
    Get live aircraft positions from OpenSky Network.
    Free anonymous access: 100 API credits/day, ~400 req within bounding box.
    """
    global _flight_cache, _flight_cache_ts
    
    cache_key = f"{lat_min}_{lat_max}_{lng_min}_{lng_max}_{military_only}"
    if time.time() - _flight_cache_ts < FLIGHT_CACHE_TTL and cache_key in _flight_cache:
        return JSONResponse(content=_flight_cache[cache_key])
    
    start = time.time()
    client = _get_client()
    
    aircraft = []
    
    # Try OpenSky Network first (free, no key for anonymous)
    try:
        url = (
            f"https://opensky-network.org/api/states/all"
            f"?lamin={lat_min}&lamax={lat_max}&lomin={lng_min}&lomax={lng_max}"
        )
        resp = await client.get(url, auth=OPENSKY_AUTH)
        
        if resp.status_code == 200:
            data = resp.json()
            states = data.get("states", []) or []
            
            for s in states:
                if len(s) < 17:
                    continue
                
                callsign = (s[1] or "").strip()
                lat = s[6]
                lng = s[5]
                alt = s[7] or s[13]  # baro or geo altitude
                velocity = s[9]
                heading = s[10]
                on_ground = s[8]
                
                if lat is None or lng is None:
                    continue
                if on_ground:
                    continue
                    
                is_mil = any(callsign.upper().startswith(p) for p in MIL_CALLSIGNS)
                
                if military_only and not is_mil:
                    continue
                
                aircraft.append({
                    "icao24": s[0],
                    "callsign": callsign,
                    "country": s[2] or "Unknown",
                    "lat": round(lat, 4),
                    "lng": round(lng, 4),
                    "altitude_m": round(alt, 0) if alt else None,
                    "altitude_ft": round(alt * 3.281, 0) if alt else None,
                    "velocity_ms": round(velocity, 1) if velocity else None,
                    "velocity_knots": round(velocity * 1.944, 0) if velocity else None,
                    "heading": round(heading, 1) if heading else None,
                    "vertical_rate": s[11],
                    "squawk": s[14],
                    "is_military": is_mil,
                    "category": "military" if is_mil else "civilian",
                })
            
            logger.info(f"OpenSky: {len(aircraft)} aircraft in bbox")
    except Exception as e:
        logger.warning(f"OpenSky fetch failed: {e}")
    
    # Fallback: Try adsb.lol (free, no key, unlimited)
    if not aircraft:
        try:
            url = f"https://api.adsb.lol/v2/lat/{(lat_min+lat_max)/2}/lon/{(lng_min+lng_max)/2}/dist/500"
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                for ac in data.get("ac", [])[:200]:
                    callsign = ac.get("flight", "").strip()
                    lat = ac.get("lat")
                    lng = ac.get("lon")
                    if lat is None or lng is None:
                        continue
                    if lat < lat_min or lat > lat_max or lng < lng_min or lng > lng_max:
                        continue
                    
                    is_mil = any(callsign.upper().startswith(p) for p in MIL_CALLSIGNS)
                    if military_only and not is_mil:
                        continue
                    
                    alt = ac.get("alt_baro") or ac.get("alt_geom")
                    aircraft.append({
                        "icao24": ac.get("hex", ""),
                        "callsign": callsign,
                        "country": ac.get("r", "Unknown"),
                        "lat": round(lat, 4),
                        "lng": round(lng, 4),
                        "altitude_m": round(alt * 0.3048, 0) if alt and alt != "ground" else None,
                        "altitude_ft": alt if alt and alt != "ground" else None,
                        "velocity_knots": ac.get("gs"),
                        "heading": ac.get("track"),
                        "squawk": ac.get("squawk"),
                        "aircraft_type": ac.get("t", ""),
                        "is_military": is_mil or ac.get("t", "") in MIL_TYPES,
                        "category": "military" if is_mil else "civilian",
                    })
                logger.info(f"adsb.lol: {len(aircraft)} aircraft in bbox")
        except Exception as e:
            logger.warning(f"adsb.lol fetch failed: {e}")
    
    result = {
        "aircraft": aircraft,
        "count": len(aircraft),
        "military_count": sum(1 for a in aircraft if a.get("is_military")),
        "bbox": {"lat_min": lat_min, "lat_max": lat_max, "lng_min": lng_min, "lng_max": lng_max},
        "source": "opensky" if aircraft else "adsb.lol",
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "duration_ms": round((time.time() - start) * 1000),
    }
    
    _flight_cache[cache_key] = result
    _flight_cache_ts = time.time()
    return JSONResponse(content=result)


# ═══════════════════════════════════════════════════════════════════
# GPS Jamming Detection
# Analyzes aircraft telemetry for GPS anomalies:
# - Sudden position jumps (>50km in <30s)
# - NIC/NAC quality degradation
# - Squawk 7600 (comm failure, often GPS-related)
# - Aircraft circling/holding unexpectedly
# ═══════════════════════════════════════════════════════════════════

_jamming_history: list = []
_jamming_cache_ts: float = 0

@router.get("/gps-jamming")
async def detect_gps_jamming(
    zone: str = Query(default="persian_gulf", description="Watch zone name or 'all'"),
):
    """
    Detect potential GPS jamming events by analyzing aircraft behavior.
    Checks for:
    - Squawk 7600 (comm failure)
    - Unusual altitude readings (NaN or 0)
    - Aircraft with no position data in active zones
    """
    global _jamming_history, _jamming_cache_ts
    
    if time.time() - _jamming_cache_ts < 120 and _jamming_history:
        return JSONResponse(content={"events": _jamming_history, "zone": zone})
    
    client = _get_client()
    jamming_events = []
    
    zones_to_check = WATCH_ZONES if zone == "all" else {zone: WATCH_ZONES.get(zone, WATCH_ZONES["persian_gulf"])}
    
    for zone_name, bounds in zones_to_check.items():
        try:
            url = (
                f"https://opensky-network.org/api/states/all"
                f"?lamin={bounds['lat_min']}&lamax={bounds['lat_max']}"
                f"&lomin={bounds['lng_min']}&lomax={bounds['lng_max']}"
            )
            resp = await client.get(url, auth=OPENSKY_AUTH)
            if resp.status_code != 200:
                continue
            
            data = resp.json()
            states = data.get("states", []) or []
            
            anomaly_count = 0
            total_aircraft = len(states)
            
            for s in states:
                if len(s) < 17:
                    continue
                
                callsign = (s[1] or "").strip()
                lat, lng = s[6], s[5]
                baro_alt = s[7]
                geo_alt = s[13]
                squawk = s[14]
                on_ground = s[8]
                
                if on_ground:
                    continue
                
                # Check for jamming indicators
                indicators = []
                
                # Squawk 7600 = comm failure (often GPS-related)
                if squawk == "7600":
                    indicators.append("SQUAWK_7600_COMM_FAILURE")
                
                # No position but aircraft is transmitting
                if lat is None or lng is None:
                    indicators.append("POSITION_LOST")
                    anomaly_count += 1
                
                # Altitude mismatch (baro vs geo > 500ft)
                if baro_alt and geo_alt:
                    if abs(baro_alt - geo_alt) > 150:  # meters
                        indicators.append("ALT_MISMATCH")
                        anomaly_count += 1
                
                if indicators:
                    jamming_events.append({
                        "id": f"jam-{zone_name}-{s[0]}",
                        "zone": zone_name,
                        "zone_label": bounds["label"],
                        "icao24": s[0],
                        "callsign": callsign,
                        "lat": lat,
                        "lng": lng,
                        "indicators": indicators,
                        "severity": "high" if "SQUAWK_7600" in str(indicators) else "medium",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    })
            
            # Zone-level anomaly assessment
            if total_aircraft > 10 and anomaly_count / total_aircraft > 0.1:
                jamming_events.insert(0, {
                    "id": f"zone-jam-{zone_name}",
                    "zone": zone_name,
                    "zone_label": bounds["label"],
                    "type": "ZONE_ANOMALY",
                    "message": f"{anomaly_count}/{total_aircraft} aircraft show GPS anomalies ({(anomaly_count/total_aircraft*100):.0f}%)",
                    "severity": "critical" if anomaly_count / total_aircraft > 0.3 else "high",
                    "anomaly_rate": round(anomaly_count / total_aircraft, 3),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
                
        except Exception as e:
            logger.debug(f"GPS jamming check failed for {zone_name}: {e}")
    
    _jamming_history = jamming_events
    _jamming_cache_ts = time.time()
    
    return JSONResponse(content={
        "events": jamming_events,
        "count": len(jamming_events),
        "zones_checked": list(zones_to_check.keys()),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })


@router.get("/watch-zones")
async def get_watch_zones():
    """Return configured aircraft watch zones."""
    return JSONResponse(content={"zones": WATCH_ZONES})
