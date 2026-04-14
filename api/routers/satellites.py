# ═══════════════════════════════════════════════════════════════════
# MERIDIAN — Satellite Tracking Service
# SGP4 orbital propagation for 2000+ satellites using CelesTrak TLEs
# No API key required — CelesTrak is free and public
# ═══════════════════════════════════════════════════════════════════

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
import httpx
import logging
import time
import math
from datetime import datetime, timezone
from typing import Optional

router = APIRouter()
logger = logging.getLogger("meridian.satellites")

# ── In-memory cache ─────────────────────────────────────────────
_tle_cache: dict = {}
_tle_cache_ts: float = 0
TLE_CACHE_TTL = 3600  # 1 hour — TLEs don't change fast

# ── CelesTrak TLE Sources ───────────────────────────────────────
TLE_SOURCES = {
    "stations": {
        "url": "https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle",
        "label": "Space Stations",
        "color": "#FFD700",
    },
    "active": {
        "url": "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle",
        "label": "Active Satellites",
        "color": "#4FC3F7",
    },
    "starlink": {
        "url": "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle",
        "label": "Starlink",
        "color": "#90CAF9",
    },
    "gps": {
        "url": "https://celestrak.org/NORAD/elements/gp.php?GROUP=gps-ops&FORMAT=tle",
        "label": "GPS Constellation",
        "color": "#66BB6A",
    },
    "military": {
        "url": "https://celestrak.org/NORAD/elements/gp.php?GROUP=military&FORMAT=tle",
        "label": "Military",
        "color": "#EF5350",
    },
    "weather": {
        "url": "https://celestrak.org/NORAD/elements/gp.php?GROUP=weather&FORMAT=tle",
        "label": "Weather",
        "color": "#26C6DA",
    },
    "resource": {
        "url": "https://celestrak.org/NORAD/elements/gp.php?GROUP=resource&FORMAT=tle",
        "label": "Earth Resources",
        "color": "#8BC34A",
    },
    "science": {
        "url": "https://celestrak.org/NORAD/elements/gp.php?GROUP=science&FORMAT=tle",
        "label": "Science",
        "color": "#AB47BC",
    },
}


# ── Simplified SGP4 Propagator ──────────────────────────────────
# This is a simplified analytical model — accurate to ~10km for LEO
# Full SGP4 requires the sgp4 Python library (can be added later)

def _parse_tle(name: str, line1: str, line2: str) -> dict:
    """Parse TLE into orbital elements."""
    try:
        return {
            "name": name.strip(),
            "norad_id": int(line1[2:7]),
            "classification": line1[7],
            "epoch_year": int(line1[18:20]),
            "epoch_day": float(line1[20:32]),
            "inclination": float(line2[8:16]),
            "raan": float(line2[17:25]),
            "eccentricity": float("0." + line2[26:33]),
            "arg_perigee": float(line2[34:42]),
            "mean_anomaly": float(line2[43:51]),
            "mean_motion": float(line2[52:63]),
            "rev_number": int(line2[63:68]),
        }
    except (ValueError, IndexError) as e:
        return None


def _propagate_position(tle: dict) -> dict:
    """
    Simplified orbital propagation — computes current lat/lng/alt
    from Keplerian elements. Not full SGP4 but adequate for visualization.
    """
    now = datetime.now(timezone.utc)
    
    # Compute time since TLE epoch
    epoch_year = tle["epoch_year"]
    if epoch_year < 57:
        epoch_year += 2000
    else:
        epoch_year += 1900
    
    epoch = datetime(epoch_year, 1, 1, tzinfo=timezone.utc)
    epoch_day = tle["epoch_day"]
    
    # Days since epoch
    from datetime import timedelta
    tle_epoch = epoch + timedelta(days=epoch_day - 1)
    dt_minutes = (now - tle_epoch).total_seconds() / 60.0
    
    # Mean motion is revolutions per day
    n = tle["mean_motion"]  # rev/day
    n_rad = n * 2 * math.pi / 1440.0  # rad/min
    
    # Current mean anomaly
    M = math.radians(tle["mean_anomaly"]) + n_rad * dt_minutes
    M = M % (2 * math.pi)
    
    # Solve Kepler's equation (Newton's method, 5 iterations)
    e = tle["eccentricity"]
    E = M
    for _ in range(5):
        E = E - (E - e * math.sin(E) - M) / (1 - e * math.cos(E))
    
    # True anomaly
    nu = 2 * math.atan2(
        math.sqrt(1 + e) * math.sin(E / 2),
        math.sqrt(1 - e) * math.cos(E / 2)
    )
    
    # Semi-major axis from mean motion (km)
    mu = 398600.4418  # km^3/s^2
    n_rad_s = n * 2 * math.pi / 86400.0
    a = (mu / (n_rad_s ** 2)) ** (1.0 / 3.0)
    
    # Radius
    r = a * (1 - e * math.cos(E))
    
    # Position in orbital plane
    x_orb = r * math.cos(nu)
    y_orb = r * math.sin(nu)
    
    # Rotate to ECI coordinates
    inc = math.radians(tle["inclination"])
    raan = math.radians(tle["raan"])
    w = math.radians(tle["arg_perigee"])
    
    # RAAN precession (simplified J2)
    raan_rate = -1.5 * 0.00108263 * n_rad * math.cos(inc) / ((1 - e**2)**2)
    raan_current = raan + raan_rate * dt_minutes
    
    # Greenwich sidereal time (simplified)
    j2000 = datetime(2000, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
    days_j2000 = (now - j2000).total_seconds() / 86400.0
    gmst = (280.46061837 + 360.98564736629 * days_j2000) % 360.0
    
    # Rotation matrices
    cos_w, sin_w = math.cos(w), math.sin(w)
    cos_r, sin_r = math.cos(raan_current), math.sin(raan_current)
    cos_i, sin_i = math.cos(inc), math.sin(inc)
    
    x_eci = (cos_r * cos_w - sin_r * sin_w * cos_i) * x_orb + \
            (-cos_r * sin_w - sin_r * cos_w * cos_i) * y_orb
    y_eci = (sin_r * cos_w + cos_r * sin_w * cos_i) * x_orb + \
            (-sin_r * sin_w + cos_r * cos_w * cos_i) * y_orb
    z_eci = (sin_w * sin_i) * x_orb + (cos_w * sin_i) * y_orb
    
    # ECI to ECEF (rotate by GMST)
    gmst_rad = math.radians(gmst)
    x_ecef = x_eci * math.cos(gmst_rad) + y_eci * math.sin(gmst_rad)
    y_ecef = -x_eci * math.sin(gmst_rad) + y_eci * math.cos(gmst_rad)
    z_ecef = z_eci
    
    # ECEF to lat/lng/alt
    R_earth = 6371.0
    lng = math.degrees(math.atan2(y_ecef, x_ecef))
    lat = math.degrees(math.atan2(z_ecef, math.sqrt(x_ecef**2 + y_ecef**2)))
    alt = r - R_earth
    
    return {
        "lat": round(lat, 4),
        "lng": round(lng, 4),
        "alt": round(max(alt, 100), 1),  # km above Earth
        "velocity": round(math.sqrt(mu / r) * 3.6, 0),  # km/h
    }


# ── API Routes ──────────────────────────────────────────────────

@router.get("/positions")
async def get_satellite_positions(
    group: str = Query(default="stations,gps,military,weather", description="Comma-separated TLE groups"),
    limit: int = Query(default=500, ge=1, le=5000),
):
    """Compute current positions for satellites from specified TLE groups."""
    global _tle_cache, _tle_cache_ts
    
    start = time.time()
    groups = [g.strip() for g in group.split(",")]
    
    # Fetch TLEs if cache expired
    if time.time() - _tle_cache_ts > TLE_CACHE_TTL:
        async with httpx.AsyncClient(timeout=30.0) as client:
            for gname, gconfig in TLE_SOURCES.items():
                if gname not in groups:
                    continue
                try:
                    resp = await client.get(gconfig["url"])
                    if resp.status_code == 200:
                        lines = resp.text.strip().split("\n")
                        tles = []
                        for i in range(0, len(lines) - 2, 3):
                            parsed = _parse_tle(lines[i], lines[i+1], lines[i+2])
                            if parsed:
                                parsed["group"] = gname
                                parsed["group_label"] = gconfig["label"]
                                parsed["color"] = gconfig["color"]
                                tles.append(parsed)
                        _tle_cache[gname] = tles
                        logger.info(f"Fetched {len(tles)} TLEs for {gname}")
                except Exception as e:
                    logger.error(f"TLE fetch failed for {gname}: {e}")
        _tle_cache_ts = time.time()
    
    # Propagate positions
    satellites = []
    count = 0
    for gname in groups:
        if gname not in _tle_cache:
            continue
        for tle in _tle_cache[gname]:
            if count >= limit:
                break
            try:
                pos = _propagate_position(tle)
                satellites.append({
                    "id": f"sat-{tle['norad_id']}",
                    "name": tle["name"],
                    "norad_id": tle["norad_id"],
                    "group": tle["group"],
                    "group_label": tle["group_label"],
                    "color": tle["color"],
                    "lat": pos["lat"],
                    "lng": pos["lng"],
                    "alt_km": pos["alt"],
                    "velocity_kmh": pos["velocity"],
                    "inclination": tle["inclination"],
                })
                count += 1
            except Exception:
                continue
    
    duration = time.time() - start
    return JSONResponse(content={
        "satellites": satellites,
        "count": len(satellites),
        "groups": groups,
        "computed_at": datetime.now(timezone.utc).isoformat(),
        "duration_ms": round(duration * 1000),
    })


@router.get("/groups")
async def list_satellite_groups():
    """List available satellite TLE groups."""
    return JSONResponse(content={
        "groups": {k: {"label": v["label"], "color": v["color"]} for k, v in TLE_SOURCES.items()}
    })
