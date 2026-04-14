# ═══════════════════════════════════════════════════════════════════
# MERIDIAN — OSINT Data Proxy Router
# Proxies external OSINT API calls to bypass CORS in production.
# In development, Vite's built-in proxy handles this instead.
# ═══════════════════════════════════════════════════════════════════

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse, Response
import httpx
import logging
import time
from typing import Optional

router = APIRouter()
logger = logging.getLogger("meridian.osint")

# Shared async HTTP client with connection pooling
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


# ── GDELT DOC 2.0 API ───────────────────────────────────────────

@router.get("/gdelt")
async def proxy_gdelt(
    query: str = Query(default="iraq OR baghdad", description="GDELT search query"),
    maxrecords: int = Query(default=75, ge=1, le=250),
    timespan: str = Query(default="24h"),
):
    """Proxy GDELT DOC 2.0 article list API — bypasses browser CORS."""
    start = time.time()
    try:
        client = _get_client()
        url = (
            f"https://api.gdeltproject.org/api/v2/doc/doc"
            f"?query={query}&mode=artlist&maxrecords={maxrecords}"
            f"&format=json&sort=datedesc&timespan={timespan}"
        )
        resp = await client.get(url)
        resp.raise_for_status()
        duration = time.time() - start
        logger.info(f"GDELT proxy: {maxrecords} records in {duration:.2f}s")
        return JSONResponse(
            content=resp.json(),
            headers={"X-Proxy-Duration": f"{duration:.3f}"},
        )
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"GDELT API error: {e}")
    except Exception as e:
        logger.error(f"GDELT proxy failed: {e}")
        raise HTTPException(status_code=502, detail=f"GDELT upstream error: {str(e)}")


# ── USGS Earthquake Feed ────────────────────────────────────────

@router.get("/usgs/earthquakes")
async def proxy_usgs_earthquakes(
    period: str = Query(default="all_day", description="Feed period: all_hour, all_day, all_week, all_month"),
):
    """Proxy USGS GeoJSON earthquake feed."""
    try:
        client = _get_client()
        url = f"https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/{period}.geojson"
        resp = await client.get(url)
        resp.raise_for_status()
        return JSONResponse(content=resp.json())
    except Exception as e:
        logger.error(f"USGS proxy failed: {e}")
        raise HTTPException(status_code=502, detail=f"USGS upstream error: {str(e)}")


# ── NASA FIRMS Fire Hotspots ────────────────────────────────────

@router.get("/firms/fires")
async def proxy_firms_fires(
    country: str = Query(default="IRQ", description="ISO 3-letter country code"),
    days: int = Query(default=1, ge=1, le=10),
):
    """Proxy NASA FIRMS VIIRS fire data CSV."""
    try:
        client = _get_client()
        url = f"https://firms.modaps.eosdis.nasa.gov/api/country/csv/VIIRS_SNPP_NRT/{country}/{days}"
        resp = await client.get(url)
        resp.raise_for_status()
        return Response(content=resp.text, media_type="text/csv")
    except Exception as e:
        logger.error(f"FIRMS proxy failed: {e}")
        raise HTTPException(status_code=502, detail=f"FIRMS upstream error: {str(e)}")


# ── RSS Intelligence Feed ───────────────────────────────────────

@router.get("/rss")
async def proxy_rss_feed(
    url: str = Query(description="RSS feed URL to fetch"),
):
    """Proxy any RSS/Atom feed URL and return raw XML."""
    # Allowlist check to prevent SSRF
    ALLOWED_DOMAINS = [
        "aljazeera.com",
        "bbci.co.uk",
        "bbc.co.uk",
        "nytimes.com",
        "reuters.com",
        "theguardian.com",
        "middleeasteye.net",
    ]
    from urllib.parse import urlparse
    parsed = urlparse(url)
    domain = parsed.hostname or ""
    if not any(domain.endswith(d) for d in ALLOWED_DOMAINS):
        raise HTTPException(status_code=403, detail=f"Domain not in allowlist: {domain}")

    try:
        client = _get_client()
        resp = await client.get(url, headers={"Accept": "application/rss+xml, application/xml, text/xml"})
        resp.raise_for_status()
        return Response(content=resp.text, media_type="application/xml")
    except Exception as e:
        logger.error(f"RSS proxy failed for {url}: {e}")
        raise HTTPException(status_code=502, detail=f"RSS upstream error: {str(e)}")


# ── Region Dossier ──────────────────────────────────────────────

@router.get("/dossier/{country_code}")
async def proxy_region_dossier(country_code: str):
    """Proxy RestCountries + Wikipedia data for a country dossier."""
    try:
        client = _get_client()

        # Fetch country data
        country_resp = await client.get(
            f"https://restcountries.com/v3.1/alpha/{country_code}",
            params={"fields": "name,capital,population,area,languages,currencies,region,subregion,flags"},
        )
        country_resp.raise_for_status()
        country = country_resp.json()

        name = country.get("name", {}).get("common", country_code)

        # Enrich with Wikipedia summary
        wiki_summary = ""
        wiki_image = ""
        try:
            wiki_resp = await client.get(
                f"https://en.wikipedia.org/api/rest_v1/page/summary/{name}"
            )
            if wiki_resp.status_code == 200:
                wiki_data = wiki_resp.json()
                wiki_summary = wiki_data.get("extract", "")
                wiki_image = wiki_data.get("thumbnail", {}).get("source", "")
        except Exception:
            pass

        return JSONResponse(content={
            **country,
            "wikiSummary": wiki_summary,
            "wikiImage": wiki_image,
        })
    except Exception as e:
        logger.error(f"Dossier proxy failed for {country_code}: {e}")
        raise HTTPException(status_code=502, detail=f"Dossier error: {str(e)}")


# ── Weather Alerts (NOAA) ───────────────────────────────────────

@router.get("/weather/alerts")
async def proxy_weather_alerts():
    """Proxy NOAA severe weather alerts."""
    try:
        client = _get_client()
        resp = await client.get(
            "https://api.weather.gov/alerts/active",
            params={"status": "actual", "severity": "Severe,Extreme"},
            headers={"User-Agent": "MERIDIAN-OSINT/2.0 (weather.gov compliance)"},
        )
        resp.raise_for_status()
        return JSONResponse(content=resp.json())
    except Exception as e:
        logger.error(f"Weather proxy failed: {e}")
        raise HTTPException(status_code=502, detail=f"Weather upstream error: {str(e)}")
