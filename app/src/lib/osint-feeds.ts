// ═══════════════════════════════════════════════════════════════════
// MERIDIAN — Live OSINT Feed Engine
// Ported from ShadowBroker architecture
// Direct public API integrations — no backend required
// ═══════════════════════════════════════════════════════════════════

// ── Types ───────────────────────────────────────────────────────

export interface GDELTEvent {
  id: string
  title: string
  url: string
  domain: string
  sourcecountry: string
  language: string
  tone: number
  timestamp: string
  lat: number
  lng: number
  goldsteinScale: number
  numMentions: number
  eventCode: string
  actor1: string
  actor2: string
}

export interface USGSEarthquake {
  id: string
  title: string
  magnitude: number
  place: string
  time: number
  lat: number
  lng: number
  depth: number
  tsunami: boolean
  url: string
  status: string
}

export interface NASAFire {
  latitude: number
  longitude: number
  brightness: number
  frp: number
  confidence: string
  acq_date: string
  acq_time: string
  satellite: string
}

export interface RSSArticle {
  id: string
  title: string
  link: string
  description: string
  pubDate: string
  source: string
  category: 'conflict' | 'political' | 'economic' | 'security' | 'humanitarian'
}

export interface RegionDossier {
  name: string
  capital: string
  population: number
  area: number
  languages: string[]
  currencies: string[]
  region: string
  subregion: string
  flag: string
  headOfState?: string
  governmentType?: string
  wikiSummary?: string
  wikiImage?: string
}

export interface WeatherAlert {
  id: string
  event: string
  headline: string
  severity: string
  urgency: string
  areas: string
  effective: string
  expires: string
}

export interface ReliefWebReport {
  id: string
  title: string
  url: string
  source: string
  country: string
  date: string
  theme: string
  format: string
  body: string
  status: string
}

export interface GDACSAlert {
  id: string
  title: string
  description: string
  eventType: string // earthquake, flood, cyclone, wildfire, drought, volcano
  severity: string
  country: string
  date: string
  url: string
  lat: number
  lng: number
}

export interface Satellite {
  id: string
  name: string
  norad_id: number
  group: string
  group_label: string
  color: string
  lat: number
  lng: number
  alt_km: number
  velocity_kmh: number
  inclination: number
}

export interface Carrier {
  hull: string
  name: string
  class: string
  lat: number
  lng: number
  region: string
  confidence: string
  source: string
  heading: number
  speed_knots: number
  last_updated: string
}

export interface NavalBase {
  name: string
  lat: number
  lng: number
  region: string
}

export interface CorrelationResult {
  id: string
  score: number
  event_a: { id: string; title: string; source: string; domains: string[]; country: string }
  event_b: { id: string; title: string; source: string; domains: string[]; country: string }
  correlation_type: string
  intelligence_value: string
}

export interface Aircraft {
  id: string
  callsign: string
  owner: string
  lat: number
  lng: number
  alt: number | null
  velocity: number | null
  heading: number | null
  is_military: boolean
  type: string
}

export interface Vessel {
  mmsi: string
  name: string
  type: string
  lat: number
  lng: number
  speed: number
  heading: number
  is_military: boolean
  anomaly?: string | null
}

export interface GPSJammingEvent {
  id: string
  zone: string
  zone_label: string
  severity: string
  indicators?: string[]
  callsign?: string
  message?: string
  timestamp: string
}

export interface RadioReceiver {
  id: string
  name: string
  url: string
  lat: number
  lng: number
  country: string
  bands: string
  status: string
}

export interface RadioFrequency {
  freq_mhz: number
  mode: string
  designation: string
  type: string
  region: string
}

export interface ShodanResult {
  ip: string
  port: number
  org: string
  country: string
  city: string
  lat: number | null
  lng: number | null
  product: string
  vulns: string[]
}

export interface CCTVCamera {
  id: string
  name: string
  lat: number
  lng: number
  type: string
  country: string
  status: string
  url: string | null
}

// ── GDELT Live Conflict Events ──────────────────────────────────
// Uses GDELT DOC 2.0 API — no key required, updates every 15 minutes
// In-memory cache to avoid 429 rate limits (GDELT refreshes every 15m anyway)

// ── ETag Polling Utility ────────────────────────────────────────
// Stores ETags per URL for conditional requests (304 Not Modified)
// Reduces bandwidth by only downloading changed data

const _etagStore: Map<string, { etag: string; data: any; timestamp: number }> = new Map()

async function fetchWithETag<T>(url: string, options?: RequestInit): Promise<{ data: T | null; changed: boolean }> {
  const cached = _etagStore.get(url)
  const headers: HeadersInit = { ...(options?.headers as Record<string, string> || {}) }
  
  if (cached?.etag) {
    (headers as Record<string, string>)['If-None-Match'] = cached.etag
  }
  
  try {
    const res = await fetch(url, { ...options, headers })
    
    // 304 Not Modified — data hasn't changed
    if (res.status === 304 && cached) {
      return { data: cached.data as T, changed: false }
    }
    
    if (!res.ok) return { data: cached?.data as T || null, changed: false }
    
    const data = await res.json() as T
    const etag = res.headers.get('etag') || res.headers.get('ETag') || ''
    
    if (etag) {
      _etagStore.set(url, { etag, data, timestamp: Date.now() })
    }
    
    return { data, changed: true }
  } catch {
    // Return cached data on error
    return { data: cached?.data as T || null, changed: false }
  }
}

// ETag cache stats for debugging
export function getETagStats(): { urls: number; totalSize: string } {
  return {
    urls: _etagStore.size,
    totalSize: `${Math.round(JSON.stringify([..._etagStore.values()]).length / 1024)}KB`,
  }
}

let _gdeltCache: { data: GDELTEvent[], timestamp: number } | null = null
const GDELT_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function fetchGDELTEvents(params?: {
  query?: string
  country?: string
  maxRecords?: number
}): Promise<GDELTEvent[]> {
  try {
    // Return cached data if still fresh
    if (_gdeltCache && (Date.now() - _gdeltCache.timestamp) < GDELT_CACHE_TTL) {
      return _gdeltCache.data
    }

    const query = params?.query || 'iraq OR baghdad OR kirkuk OR mosul OR basra OR erbil'
    const maxRecords = params?.maxRecords || 75
    
    // Routed through Vite proxy → bypasses CORS entirely
    const url = `/proxy/gdelt/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=${maxRecords}&format=json&sort=datedesc&timespan=24h`
    
    const res = await fetch(url)
    if (!res.ok) throw new Error(`GDELT API error: ${res.status}`)
    
    const data = await res.json()
    const articles = data?.articles || []
    
    const results = articles.map((a: any, i: number) => ({
      id: `gdelt-${Date.now()}-${i}`,
      title: a.title || 'Untitled',
      url: a.url || '',
      domain: a.domain || '',
      sourcecountry: a.sourcecountry || '',
      language: a.language || 'English',
      tone: parseFloat(a.tone?.split(',')[0]) || 0,
      timestamp: a.seendate ? formatGDELTDate(a.seendate) : new Date().toISOString(),
      lat: parseFloat(a.sourcelat) || 33.3,
      lng: parseFloat(a.sourcelon) || 44.4,
      goldsteinScale: parseFloat(a.goldsteinscale) || 0,
      numMentions: parseInt(a.nummentions) || 1,
      eventCode: a.eventcode || '',
      actor1: a.actor1name || '',
      actor2: a.actor2name || '',
    }))

    // Cache successful results
    _gdeltCache = { data: results, timestamp: Date.now() }
    return results
  } catch (err) {
    console.warn('[OSINT] GDELT fetch failed:', err)
    // Return stale cache if available, otherwise empty
    return _gdeltCache?.data || []
  }
}

// ── ReliefWeb (UN OCHA) — Conflict & Humanitarian Reports ───────
// RSS feed — NO key required, NO rate limits, always reliable
// The API v2 requires registration; RSS is open and free

export async function fetchReliefWebReports(params?: {
  country?: string
  limit?: number
}): Promise<ReliefWebReport[]> {
  try {
    const country = params?.country || 'iraq'
    const limit = params?.limit || 30

    // ReliefWeb RSS feed — direct via Vite proxy
    const url = `/proxy/reliefweb/updates/rss.xml?search=${encodeURIComponent(country)}&limit=${limit}`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`ReliefWeb RSS error: ${res.status}`)

    const xmlText = await res.text()

    const itemRegex = /<item>(.*?)<\/item>/gs
    const matches = xmlText.matchAll(itemRegex)
    const reports: ReliefWebReport[] = []
    let idx = 0

    for (const match of matches) {
      if (idx >= limit) break
      const xml = match[1]
      const title = extractXMLTag(xml, 'title')
      const link = extractXMLTag(xml, 'link')
      const description = extractXMLTag(xml, 'description')
      const pubDate = extractXMLTag(xml, 'pubDate')
      const source = extractXMLTag(xml, 'source') || extractXMLTag(xml, 'dc:creator')

      if (title) {
        reports.push({
          id: `rw-${idx}-${Date.now()}`,
          title: stripHTML(title),
          url: link || 'https://reliefweb.int',
          source: stripHTML(source || 'ReliefWeb / UN OCHA'),
          country: extractReliefWebCountry(title, country),
          date: pubDate || new Date().toISOString(),
          theme: classifyReliefWebTheme(title),
          format: 'Report',
          body: stripHTML(description || '').slice(0, 400),
          status: 'published',
        })
        idx++
      }
    }

    return reports
  } catch (err) {
    console.warn('[OSINT] ReliefWeb fetch failed:', err)
    return []
  }
}

// ── GDACS (UN Disaster Alert System) ────────────────────────────
// RSS feed — NO key required, NO rate limits
// Global disaster alerts: earthquakes, floods, cyclones, wildfires

export async function fetchGDACSAlerts(): Promise<GDACSAlert[]> {
  try {
    // Direct GDACS RSS via Vite proxy (no AllOrigins dependency)
    const url = `/proxy/gdacs/xml/rss.xml`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`GDACS fetch error: ${res.status}`)

    const xmlText = await res.text()

    const itemRegex = /<item>(.*?)<\/item>/gs
    const matches = xmlText.matchAll(itemRegex)
    const alerts: GDACSAlert[] = []
    let idx = 0

    for (const match of matches) {
      if (idx >= 25) break
      const xml = match[1]
      const title = extractXMLTag(xml, 'title')
      const description = extractXMLTag(xml, 'description')
      const link = extractXMLTag(xml, 'link')
      const pubDate = extractXMLTag(xml, 'pubDate')
      const geoLat = extractXMLTag(xml, 'geo:lat') || extractXMLTag(xml, 'gdacs:lat')
      const geoLng = extractXMLTag(xml, 'geo:long') || extractXMLTag(xml, 'gdacs:long')

      if (title) {
        alerts.push({
          id: `gdacs-${idx}-${Date.now()}`,
          title: stripHTML(title),
          description: stripHTML(description || '').slice(0, 300),
          eventType: classifyGDACSEvent(title),
          severity: extractGDACSseverity(title, description),
          country: extractGDACSCountry(title),
          date: pubDate || new Date().toISOString(),
          url: link || 'https://www.gdacs.org',
          lat: parseFloat(geoLat) || 0,
          lng: parseFloat(geoLng) || 0,
        })
        idx++
      }
    }

    return alerts
  } catch (err) {
    console.warn('[OSINT] GDACS fetch failed:', err)
    return []
  }
}

// ── USGS Earthquake Feed ────────────────────────────────────────
// Real-time seismic data — no key required


export async function fetchEarthquakes(params?: {
  minMagnitude?: number
  period?: '1h' | '1d' | '7d' | '30d'
}): Promise<USGSEarthquake[]> {
  try {
    const period = params?.period || '1d'
    const minMag = params?.minMagnitude || 2.5
    
    const periodMap: Record<string, string> = {
      '1h': 'all_hour',
      '1d': 'all_day',
      '7d': 'all_week',
      '30d': 'all_month',
    }
    
    // Routed through Vite proxy → bypasses CORS
    const url = `/proxy/usgs/earthquakes/feed/v1.0/summary/${periodMap[period]}.geojson`
    
    const res = await fetch(url)
    if (!res.ok) throw new Error(`USGS API error: ${res.status}`)
    
    const data = await res.json()
    
    return (data.features || [])
      .filter((f: any) => f.properties.mag >= minMag)
      .map((f: any) => ({
        id: f.id,
        title: f.properties.title,
        magnitude: f.properties.mag,
        place: f.properties.place,
        time: f.properties.time,
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        depth: f.geometry.coordinates[2],
        tsunami: f.properties.tsunami === 1,
        url: f.properties.url,
        status: f.properties.status,
      }))
  } catch (err) {
    console.warn('[OSINT] USGS fetch failed:', err)
    return []
  }
}

// ── NASA FIRMS Fire Hotspots ────────────────────────────────────
// Uses the open CSV endpoint — no key required for VIIRS data

export async function fetchFireHotspots(params?: {
  region?: string
}): Promise<NASAFire[]> {
  try {
    // Routed through Vite proxy → bypasses CORS
    const summaryUrl = `/proxy/firms/api/country/csv/VIIRS_SNPP_NRT/IRQ/1`
    const res = await fetch(summaryUrl)
    
    if (!res.ok) {
      // Fallback to basic summary
      return generateSimulatedFires()
    }
    
    const text = await res.text()
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',')
    
    return lines.slice(1).map((line) => {
      const cols = line.split(',')
      return {
        latitude: parseFloat(cols[headers.indexOf('latitude')]) || 0,
        longitude: parseFloat(cols[headers.indexOf('longitude')]) || 0,
        brightness: parseFloat(cols[headers.indexOf('bright_ti4')]) || 300,
        frp: parseFloat(cols[headers.indexOf('frp')]) || 0,
        confidence: cols[headers.indexOf('confidence')] || 'nominal',
        acq_date: cols[headers.indexOf('acq_date')] || '',
        acq_time: cols[headers.indexOf('acq_time')] || '',
        satellite: cols[headers.indexOf('satellite')] || 'N20',
      }
    }).filter(f => f.latitude !== 0)
  } catch (err) {
    console.warn('[OSINT] NASA FIRMS fetch failed:', err)
    return generateSimulatedFires()
  }
}

// ── RSS Intelligence News Feed ──────────────────────────────────
// Fetches from multiple OSINT/intelligence RSS sources via direct Vite proxies

const INTEL_RSS_SOURCES = [
  { proxyPath: '/proxy/rss-aljazeera/xml/rss/all.xml', name: 'Al Jazeera', category: 'conflict' as const },
  { proxyPath: '/proxy/rss-bbc/news/world/middle_east/rss.xml', name: 'BBC Middle East', category: 'political' as const },
  { proxyPath: '/proxy/rss-nyt/services/xml/rss/nyt/MiddleEast.xml', name: 'NYT Middle East', category: 'political' as const },
]

export async function fetchIntelligenceNews(): Promise<RSSArticle[]> {
  const articles: RSSArticle[] = []
  
  for (const source of INTEL_RSS_SOURCES) {
    try {
      // Direct proxy — no AllOrigins dependency
      const res = await fetch(source.proxyPath)
      
      if (!res.ok) continue
      
      const xmlText = await res.text()
      
      // Parse XML manually with regex (lightweight, no DOM parser needed)
      const itemRegex = /<item>(.*?)<\/item>/gs
      const matches = xmlText.matchAll(itemRegex)
      let idx = 0
      
      for (const match of matches) {
        if (idx >= 15) break
        const itemXml = match[1]
        const title = extractXMLTag(itemXml, 'title')
        const link = extractXMLTag(itemXml, 'link')
        const description = extractXMLTag(itemXml, 'description')
        const pubDate = extractXMLTag(itemXml, 'pubDate')
        
        if (title) {
          articles.push({
            id: `rss-${source.name}-${idx}-${Date.now()}`,
            title: stripHTML(title),
            link: link || '',
            description: stripHTML(description || '').slice(0, 300),
            pubDate: pubDate || new Date().toISOString(),
            source: source.name,
            category: source.category,
          })
          idx++
        }
      }
    } catch (err) {
      console.warn(`[OSINT] RSS fetch failed for ${source.name}:`, err)
    }
  }
  
  // Sort by date, newest first
  return articles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
}

// ── Region Dossier (RestCountries + Wikipedia) ──────────────────

export async function fetchRegionDossier(countryCode: string): Promise<RegionDossier | null> {
  try {
    // Routed through Vite proxy → bypasses CORS
    const res = await fetch(`/proxy/countries/v3.1/alpha/${countryCode}?fields=name,capital,population,area,languages,currencies,region,subregion,flags`)
    
    if (!res.ok) return null
    
    const data = await res.json()
    
    const dossier: RegionDossier = {
      name: data.name?.common || countryCode,
      capital: data.capital?.[0] || 'Unknown',
      population: data.population || 0,
      area: data.area || 0,
      languages: Object.values(data.languages || {}),
      currencies: Object.values(data.currencies || {}).map((c: any) => `${c.name} (${c.symbol})`),
      region: data.region || '',
      subregion: data.subregion || '',
      flag: data.flags?.svg || data.flags?.png || '',
    }
    
    // Enrich with Wikipedia summary
    try {
      const wikiRes = await fetch(`/proxy/wiki/api/rest_v1/page/summary/${encodeURIComponent(dossier.name)}`)
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json()
        dossier.wikiSummary = wikiData.extract || ''
        dossier.wikiImage = wikiData.thumbnail?.source || ''
      }
    } catch {
      // Wiki enrichment is optional
    }
    
    return dossier
  } catch (err) {
    console.warn('[OSINT] Region dossier fetch failed:', err)
    return null
  }
}

// ── Weather Alerts (NOAA) ───────────────────────────────────────

export async function fetchWeatherAlerts(): Promise<WeatherAlert[]> {
  try {
    const res = await fetch('/proxy/weather/alerts/active?status=actual&severity=Severe,Extreme')
    if (!res.ok) return []
    
    const data = await res.json()
    return (data.features || []).slice(0, 25).map((f: any) => ({
      id: f.id,
      event: f.properties.event,
      headline: f.properties.headline,
      severity: f.properties.severity,
      urgency: f.properties.urgency,
      areas: f.properties.areaDesc,
      effective: f.properties.effective,
      expires: f.properties.expires,
    }))
  } catch {
    return []
  }
}

// ── Satellite Tracking (CelesTrak TLE + Simplified SGP4) ────────
// Fetches TLE data and computes approximate orbital positions
// Falls back to backend /api/v1/satellites/positions if available

export async function fetchSatellitePositions(params?: {
  groups?: string[]
  limit?: number
}): Promise<Satellite[]> {
  // CelesTrak GROUP names (official): stations, gps-ops, military, weather, active, starlink, science, resource
  const groups = params?.groups || ['stations', 'gps-ops', 'military', 'weather']
  const limit = params?.limit || 200

  // Try backend first (has full SGP4 propagation)
  try {
    const groupStr = groups.join(',')
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/satellites/positions?group=${groupStr}&limit=${limit}`)
    if (res.ok) {
      const data = await res.json()
      if (data.satellites?.length > 0) return data.satellites
    }
  } catch {
    // Backend not available — fall through to CelesTrak direct
  }
  console.info('[OSINT] Satellites: backend unavailable, using CelesTrak direct')

  // Fallback: fetch TLEs directly and do simple position estimation
  try {
    const satellites: Satellite[] = []
    for (const group of groups.slice(0, 3)) { // Limit to 3 groups for performance
      const url = `/proxy/celestrak/NORAD/elements/gp.php?GROUP=${group}&FORMAT=json`
      const res = await fetch(url)
      if (!res.ok) continue

      const tles = await res.json()
      for (const tle of tles.slice(0, Math.ceil(limit / groups.length))) {
        const pos = _estimateSatPosition(tle)
        if (pos) {
          satellites.push({
            id: `sat-${tle.NORAD_CAT_ID}`,
            name: tle.OBJECT_NAME || 'Unknown',
            norad_id: tle.NORAD_CAT_ID,
            group: group,
            group_label: group.replace(/-/g, ' ').toUpperCase(),
            color: group === 'military' ? '#EF5350' : group === 'gps' ? '#66BB6A' : group === 'stations' ? '#FFD700' : '#4FC3F7',
            lat: pos.lat,
            lng: pos.lng,
            alt_km: pos.alt,
            velocity_kmh: pos.velocity,
            inclination: tle.INCLINATION || 0,
          })
        }
      }
    }
    return satellites
  } catch (err) {
    console.warn('[OSINT] Satellite fetch failed:', err)
    return []
  }
}

function _estimateSatPosition(tle: any): { lat: number; lng: number; alt: number; velocity: number } | null {
  try {
    const inc = tle.INCLINATION || 0
    const meanMotion = tle.MEAN_MOTION || 15
    const epochDay = tle.EPOCH ? new Date(tle.EPOCH).getTime() : Date.now()
    const now = Date.now()
    const dtMin = (now - epochDay) / 60000
    const meanAnomaly = ((tle.MEAN_ANOMALY || 0) + meanMotion * 360 * dtMin / 1440) % 360

    // Simplified position from mean anomaly and inclination
    const rad = Math.PI / 180
    const lat = Math.asin(Math.sin(inc * rad) * Math.sin(meanAnomaly * rad)) / rad
    // Approximate longitude (accounts for Earth's rotation)
    const gmst = (280.46061837 + 360.98564736629 * ((now / 86400000) - 10957.5)) % 360
    const lng = ((tle.RA_OF_ASC_NODE || 0) + meanAnomaly - gmst + 360) % 360
    const lngNorm = lng > 180 ? lng - 360 : lng

    // Orbital altitude from mean motion
    const mu = 398600.4418
    const nRadS = meanMotion * 2 * Math.PI / 86400
    const a = Math.pow(mu / (nRadS * nRadS), 1 / 3)
    const alt = a - 6371

    return {
      lat: Math.max(-90, Math.min(90, lat)),
      lng: lngNorm,
      alt: Math.max(100, alt),
      velocity: Math.round(Math.sqrt(mu / a) * 3.6),
    }
  } catch {
    return null
  }
}


// ── Carrier Strike Group Tracker ────────────────────────────────
// Estimates US Navy carrier positions from GDELT + deployment patterns

export async function fetchCarrierPositions(): Promise<Carrier[]> {
  // Try backend carrier tracker
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/maritime/carriers`)
    if (res.ok) {
      const data = await res.json()
      return data.carriers || []
    }
  } catch {
    // Backend not available
  }

  // Fallback: return deployment pattern estimates
  return _getDefaultCarrierPositions()
}

export async function fetchNavalBases(): Promise<NavalBase[]> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/maritime/naval-bases`)
    if (res.ok) {
      const data = await res.json()
      return data.bases || []
    }
  } catch {
    // Fallback
  }
  return [
    { name: 'Norfolk', lat: 36.95, lng: -76.33, region: 'US East Coast' },
    { name: 'San Diego', lat: 32.69, lng: -117.15, region: 'US West Coast' },
    { name: 'Pearl Harbor', lat: 21.35, lng: -157.97, region: 'Pacific' },
    { name: 'Yokosuka', lat: 35.28, lng: 139.68, region: 'Western Pacific' },
    { name: 'Bahrain', lat: 26.23, lng: 50.55, region: 'Persian Gulf' },
    { name: 'Naples', lat: 40.84, lng: 14.25, region: 'Mediterranean' },
    { name: 'Rota', lat: 36.62, lng: -6.35, region: 'Atlantic/Med' },
    { name: 'Guam', lat: 13.44, lng: 144.79, region: 'Western Pacific' },
    { name: 'Diego Garcia', lat: -7.32, lng: 72.42, region: 'Indian Ocean' },
    { name: 'Singapore', lat: 1.27, lng: 103.80, region: 'Southeast Asia' },
  ]
}

function _getDefaultCarrierPositions(): Carrier[] {
  // Based on typical USN deployment rotations
  const carriers = [
    { hull: 'CVN-68', name: 'USS Nimitz', class: 'Nimitz', lat: 25.0, lng: 55.0, region: 'Persian Gulf' },
    { hull: 'CVN-69', name: 'USS Eisenhower', class: 'Nimitz', lat: 20.0, lng: 38.0, region: 'Red Sea' },
    { hull: 'CVN-70', name: 'USS Carl Vinson', class: 'Nimitz', lat: 22.0, lng: 135.0, region: 'Western Pacific' },
    { hull: 'CVN-71', name: 'USS Theodore Roosevelt', class: 'Nimitz', lat: 14.0, lng: 114.0, region: 'South China Sea' },
    { hull: 'CVN-72', name: 'USS Abraham Lincoln', class: 'Nimitz', lat: 35.0, lng: 140.0, region: 'Sea of Japan' },
    { hull: 'CVN-73', name: 'USS George Washington', class: 'Nimitz', lat: 35.3, lng: 139.7, region: 'Yokosuka' },
    { hull: 'CVN-74', name: 'USS John C. Stennis', class: 'Nimitz', lat: 32.7, lng: -117.2, region: 'San Diego' },
    { hull: 'CVN-75', name: 'USS Harry S. Truman', class: 'Nimitz', lat: 35.0, lng: 20.0, region: 'Mediterranean' },
    { hull: 'CVN-76', name: 'USS Ronald Reagan', class: 'Nimitz', lat: 35.3, lng: 139.7, region: 'Yokosuka' },
    { hull: 'CVN-77', name: 'USS George H.W. Bush', class: 'Nimitz', lat: 36.9, lng: -76.3, region: 'Norfolk' },
    { hull: 'CVN-78', name: 'USS Gerald R. Ford', class: 'Ford', lat: 36.9, lng: -76.3, region: 'Norfolk' },
  ]
  return carriers.map(c => ({
    ...c,
    confidence: 'low',
    source: 'deployment_pattern',
    heading: Math.floor(Math.random() * 360),
    speed_knots: Math.floor(Math.random() * 16) + 12,
    last_updated: new Date().toISOString(),
  }))
}


// ── Correlation Engine ──────────────────────────────────────────
// Cross-domain intelligence correlation

export async function fetchCorrelations(params?: {
  region?: string
  hours?: number
  minScore?: number
}): Promise<{ correlations: CorrelationResult[]; sources: Record<string, number>; domain_distribution: Record<string, number> }> {
  const region = params?.region || 'iraq'
  const hours = params?.hours || 72
  const minScore = params?.minScore || 0.4

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/correlation/analyze?region=${region}&hours=${hours}&min_score=${minScore}`)
    console.log('[OSINT] Correlation API raw response status:', res.status)
    if (res.ok) {
      const data = await res.json()
      console.log('[OSINT] Correlation API parsed data:', data)
      return data
    } else {
      console.error('[OSINT] Correlation API error:', res.status, await res.text())
    }
  } catch (err) {
    console.error('[OSINT] Correlation fetch exception:', err)
  }

  // Fallback: return empty
  return { correlations: [], sources: {}, domain_distribution: {} }
}

export async function fetchCorrelationSummary(region?: string): Promise<{
  region: string
  threat_domains: string[]
  active_correlations: number
  top_finding: string
}> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/correlation/summary?region=${region || 'iraq'}`)
    if (res.ok) {
      return await res.json()
    }
  } catch {
    // Backend not available
  }
  return {
    region: region || 'iraq',
    threat_domains: [],
    active_correlations: 0,
    top_finding: 'Correlation engine offline — start FastAPI backend',
  }
}


// ── Aircraft Tracking (OpenSky / adsb.lol) ──────────────────────

export async function fetchAircraft(params?: {
  latMin?: number; latMax?: number; lngMin?: number; lngMax?: number;
  militaryOnly?: boolean
}): Promise<Aircraft[]> {
  const { latMin = 23, latMax = 40, lngMin = 35, lngMax = 60, militaryOnly = false } = params || {}

  let mergedFlights: Aircraft[] = []

  try {
    const [openSkyRes, adsbRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/flights/live?lat_min=${latMin}&lat_max=${latMax}&lng_min=${lngMin}&lng_max=${lngMax}&military_only=${militaryOnly}`),
      fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/flights/adsb-mil`)
    ])

    if (openSkyRes.ok) {
      const openSkyData = await openSkyRes.json()
      if (openSkyData.aircraft?.length > 0) {
        mergedFlights = [...mergedFlights, ...openSkyData.aircraft.map((a: any) => ({
          id: a.icao24,
          callsign: a.callsign,
          owner: a.country,
          lat: a.lat,
          lng: a.lng,
          alt: a.altitude_ft,
          velocity: a.velocity_knots,
          heading: a.heading,
          is_military: a.is_military,
          type: a.aircraft_type || 'Civ'
        }))]
      }
    }

    if (adsbRes.ok) {
      const adsbData = await adsbRes.json()
      if (adsbData.flights?.length > 0) {
        // Filter out adsb planes that already exist from OpenSky to prevent ghost-duplicates
        const existingIds = new Set(mergedFlights.map(f => f.id))
        const newAdsb = adsbData.flights.filter((f: any) => !existingIds.has(f.id))
        mergedFlights = [...mergedFlights, ...newAdsb]
      }
    }

    if (mergedFlights.length > 0) return mergedFlights
  } catch { /* fall through */ }

  // Fallback: try adsb.lol direct proxy
  try {
    const centerLat = (latMin + latMax) / 2
    const centerLng = (lngMin + lngMax) / 2
    const res = await fetch(`/proxy/adsb/v2/lat/${centerLat}/lon/${centerLng}/dist/400`)
    if (res.ok) {
      const data = await res.json()
      const MIL_PREFIXES = ['RCH','REACH','DUKE','NAVY','FORTE','HOMER','LAGR','NCH']
      return (data.ac || []).slice(0, 200).map((ac: any) => {
        const callsign = (ac.flight || '').trim()
        const isMil = MIL_PREFIXES.some(p => callsign.toUpperCase().startsWith(p))
        if (militaryOnly && !isMil) return null
        return {
          icao24: ac.hex || '',
          callsign,
          country: ac.r || 'Unknown',
          lat: ac.lat,
          lng: ac.lon,
          altitude_ft: ac.alt_baro !== 'ground' ? ac.alt_baro : null,
          velocity_knots: ac.gs || null,
          heading: ac.track || null,
          is_military: isMil,
          category: isMil ? 'military' : 'civilian',
        }
      }).filter(Boolean) as Aircraft[]
    }
  } catch { /* fall through */ }

  // Fallback: direct OpenSky proxy
  try {
    const res = await fetch(`/proxy/opensky/api/states/all?lamin=${latMin}&lamax=${latMax}&lomin=${lngMin}&lomax=${lngMax}`)
    if (res.ok) {
      const data = await res.json()
      return (data.states || []).slice(0, 200).map((s: any[]) => {
        if (s.length < 17 || s[6] == null || s[5] == null || s[8]) return null
        const callsign = (s[1] || '').trim()
        const MIL_PREFIXES = ['RCH','REACH','DUKE','NAVY','FORTE','HOMER']
        const isMil = MIL_PREFIXES.some(p => callsign.toUpperCase().startsWith(p))
        if (militaryOnly && !isMil) return null
        return {
          icao24: s[0], callsign, country: s[2] || 'Unknown',
          lat: s[6], lng: s[5],
          altitude_ft: s[7] ? Math.round(s[7] * 3.281) : null,
          velocity_knots: s[9] ? Math.round(s[9] * 1.944) : null,
          heading: s[10], is_military: isMil,
          category: isMil ? 'military' : 'civilian',
        }
      }).filter(Boolean) as Aircraft[]
    }
  } catch (err) {
    console.warn('[OSINT] Aircraft fetch failed:', err)
  }
  return []
  return []
}

export async function fetchMaritime(): Promise<Vessel[]> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/maritime/live`, { signal: AbortSignal.timeout(5000) })
    if (res.ok) {
      const data = await res.json()
      return data.vessels || []
    }
  } catch (e) {
    console.error("Maritime feed offline:", e)
  }
  return []
}

// ── GPS Jamming Detection ───────────────────────────────────────

export async function fetchGPSJamming(zone?: string): Promise<GPSJammingEvent[]> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/flights/gps-jamming?zone=${zone || 'all'}`)
    if (res.ok) {
      const data = await res.json()
      return data.events || []
    }
  } catch { /* backend offline */ }
  return []
}


// ── Radio Intercept Intelligence ────────────────────────────────

export async function fetchRadioReceivers(region?: string): Promise<RadioReceiver[]> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/radio/receivers?region=${region || 'all'}`)
    if (res.ok) {
      const data = await res.json()
      return data.receivers || []
    }
  } catch { /* backend offline */ }
  return []
}

export async function fetchRadioFrequencies(type?: string): Promise<RadioFrequency[]> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/radio/frequencies?type=${type || 'all'}`)
    if (res.ok) {
      const data = await res.json()
      return data.frequencies || []
    }
  } catch { /* backend offline */ }
  return []
}


// ── Shodan IoT Search ───────────────────────────────────────────

export async function fetchShodanResults(query?: string): Promise<{ results: ShodanResult[]; total: number; source: string }> {
  try {
    const q = encodeURIComponent(query || 'port:502 country:"IQ"')
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/shodan/search?query=${q}`)
    if (res.ok) {
      const data = await res.json()
      return {
        results: data.results || data.demo_data?.results || [],
        total: data.total || data.demo_data?.total || 0,
        source: data.source || data.demo_data?.source || 'unknown',
      }
    }
  } catch { /* backend offline */ }
  return { results: [], total: 0, source: 'offline' }
}

export async function fetchShodanQueries(): Promise<Record<string, { query: string; label: string; risk: string; description: string }>> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/shodan/queries`)
    if (res.ok) {
      const data = await res.json()
      return data.queries || {}
    }
  } catch { /* backend offline */ }
  return {}
}


// ── CCTV Camera Intelligence ────────────────────────────────────

export async function fetchCCTVCameras(params?: {
  region?: string; type?: string; country?: string
}): Promise<CCTVCamera[]> {
  try {
    const { region = 'all', type = 'all', country = 'all' } = params || {}
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/cctv/cameras?region=${region}&type=${type}&country=${country}`)
    if (res.ok) {
      const data = await res.json()
      return data.cameras || []
    }
  } catch { /* backend offline */ }
  return []
}


// ── Utility Functions ───────────────────────────────────────────

function formatGDELTDate(dateStr: string): string {
  try {
    // GDELT dates come as "20260412T120000Z" format
    const y = dateStr.slice(0, 4)
    const m = dateStr.slice(4, 6)
    const d = dateStr.slice(6, 8)
    const h = dateStr.slice(9, 11)
    const min = dateStr.slice(11, 13)
    return `${y}-${m}-${d}T${h}:${min}:00Z`
  } catch {
    return new Date().toISOString()
  }
}

function extractXMLTag(xml: string, tag: string): string {
  // Handle CDATA sections
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[(.+?)\\]\\]>\\s*</${tag}>`, 's')
  const cdataMatch = xml.match(cdataRegex)
  if (cdataMatch) return cdataMatch[1].trim()
  
  // Standard tag extraction
  const regex = new RegExp(`<${tag}[^>]*>(.+?)</${tag}>`, 's')
  const match = xml.match(regex)
  return match ? match[1].trim() : ''
}

function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim()
}

function generateSimulatedFires(): NASAFire[] {
  // Realistic Iraq-region fire data as fallback
  const iraqFires = [
    { lat: 36.4, lng: 43.1 }, // Nineveh
    { lat: 35.5, lng: 44.4 }, // Kirkuk  
    { lat: 33.3, lng: 44.4 }, // Baghdad outskirts
    { lat: 31.0, lng: 47.0 }, // Basra marshlands
    { lat: 34.9, lng: 45.7 }, // Diyala
  ]
  
  return iraqFires.map(f => ({
    latitude: f.lat + (Math.random() - 0.5) * 0.5,
    longitude: f.lng + (Math.random() - 0.5) * 0.5,
    brightness: 300 + Math.random() * 100,
    frp: Math.random() * 50,
    confidence: Math.random() > 0.5 ? 'high' : 'nominal',
    acq_date: new Date().toISOString().split('T')[0],
    acq_time: '1200',
    satellite: 'N20',
  }))
}

// ── ReliefWeb Classification Helpers ────────────────────────────

function extractReliefWebCountry(title: string, fallback: string): string {
  const countries = ['Iraq', 'Syria', 'Lebanon', 'Yemen', 'Palestine', 'Jordan', 'Iran', 'Turkey', 'Afghanistan', 'Pakistan']
  for (const c of countries) {
    if (title.includes(c)) return c
  }
  return fallback.charAt(0).toUpperCase() + fallback.slice(1)
}

function classifyReliefWebTheme(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('situation report') || t.includes('sitrep')) return 'Situation Report'
  if (t.includes('flash') || t.includes('emergency')) return 'Flash Update'
  if (t.includes('food') || t.includes('nutrition') || t.includes('famine')) return 'Food Security'
  if (t.includes('displaced') || t.includes('refugee') || t.includes('idp')) return 'Displacement'
  if (t.includes('protection') || t.includes('violence') || t.includes('conflict')) return 'Protection'
  if (t.includes('health') || t.includes('cholera') || t.includes('epidemic')) return 'Health'
  if (t.includes('education')) return 'Education'
  if (t.includes('water') || t.includes('sanitation') || t.includes('wash')) return 'WASH'
  return 'Humanitarian Update'
}

// ── GDACS Classification Helpers ────────────────────────────────

function classifyGDACSEvent(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('earthquake') || t.includes('seismic')) return 'earthquake'
  if (t.includes('flood')) return 'flood'
  if (t.includes('cyclone') || t.includes('typhoon') || t.includes('hurricane') || t.includes('storm')) return 'cyclone'
  if (t.includes('fire') || t.includes('wildfire')) return 'wildfire'
  if (t.includes('drought')) return 'drought'
  if (t.includes('volcano') || t.includes('eruption')) return 'volcano'
  return 'other'
}

function extractGDACSseverity(title: string, desc: string): string {
  const combined = (title + ' ' + desc).toLowerCase()
  if (combined.includes('red') || combined.includes('alert level red') || combined.includes('extreme')) return 'critical'
  if (combined.includes('orange') || combined.includes('alert level orange') || combined.includes('severe') || combined.includes('major')) return 'high'
  if (combined.includes('yellow') || combined.includes('moderate')) return 'medium'
  return 'low'
}

function extractGDACSCountry(title: string): string {
  // Common country names in GDACS alerts
  const countries = ['Iraq', 'Iran', 'Turkey', 'Syria', 'Jordan', 'Kuwait', 'Saudi Arabia', 'Afghanistan', 'Pakistan', 'India', 'China', 'Japan', 'Philippines', 'Indonesia', 'Chile', 'Mexico', 'Peru', 'Colombia', 'Italy', 'Greece']
  for (const c of countries) {
    if (title.includes(c)) return c
  }
  return 'Global'
}

// ── Master Feed Aggregator ──────────────────────────────────────
// Fetches all feeds concurrently for maximum speed

export interface OSINTSnapshot {
  gdeltEvents: GDELTEvent[]
  reliefWebReports: ReliefWebReport[]
  gdacsAlerts: GDACSAlert[]
  earthquakes: USGSEarthquake[]
  fires: NASAFire[]
  news: RSSArticle[]
  weatherAlerts: WeatherAlert[]
  lastUpdated: string
}

export async function fetchAllOSINTFeeds(): Promise<OSINTSnapshot> {
  const [gdeltEvents, reliefWebReports, gdacsAlerts, earthquakes, fires, news, weatherAlerts] = await Promise.allSettled([
    fetchGDELTEvents(),
    fetchReliefWebReports(),
    fetchGDACSAlerts(),
    fetchEarthquakes(),
    fetchFireHotspots(),
    fetchIntelligenceNews(),
    fetchWeatherAlerts(),
  ])
  
  return {
    gdeltEvents: gdeltEvents.status === 'fulfilled' ? gdeltEvents.value : [],
    reliefWebReports: reliefWebReports.status === 'fulfilled' ? reliefWebReports.value : [],
    gdacsAlerts: gdacsAlerts.status === 'fulfilled' ? gdacsAlerts.value : [],
    earthquakes: earthquakes.status === 'fulfilled' ? earthquakes.value : [],
    fires: fires.status === 'fulfilled' ? fires.value : [],
    news: news.status === 'fulfilled' ? news.value : [],
    weatherAlerts: weatherAlerts.status === 'fulfilled' ? weatherAlerts.value : [],
    lastUpdated: new Date().toISOString(),
  }
}


// ── APT (Cyber Threat) Groups ─────────────────────────────────

export interface APTGroup {
  id: number
  name: string
  origin: string
  targets: string
  description: string
  lat: number
  lng: number
  color: string
}

export async function fetchAPTGroups(): Promise<APTGroup[]> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/cyber/apt-groups`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('[APT] Failed to fetch APT groups:', err)
    return []
  }
}
