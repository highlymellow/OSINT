import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { 
  Layers, Crosshair, Globe2, Orbit, Flame, Activity,
  Play, Pause, AlertTriangle, Info, ExternalLink, X, RadioTower,
  Anchor, Satellite, Camera, Server, Radio,
  AirplaneTilt, SecurityCamera, Boat, Fire, Siren,
  GasPump, MapTrifold, WaveSine, Broadcast, Binoculars,
  Thermometer, RocketLaunch, ShieldCheck, NavigationArrow,
 } from "@/lib/icons"
import type { ComponentType } from 'react'
import {
  Map,
  MapMarker,
  MarkerContent,
  MapRoute,
  MarkerLabel,
} from "@/components/ui/map"
import { TerrainWebGLLayers } from './TerrainWebGLLayers'
import {
  fetchEarthquakes,
  fetchFireHotspots,
  fetchRegionDossier,
  fetchSatellitePositions,
  fetchCarrierPositions,
  fetchNavalBases,
  fetchAircraft,
  fetchCCTVCameras,
  fetchShodanResults,
  fetchRadioReceivers,
  fetchAPTGroups,
  type USGSEarthquake,
  type NASAFire,
  type RegionDossier,
  type Satellite as SatelliteType,
  type Carrier,
  type NavalBase,
  type Aircraft,
  type CCTVCamera,
  type ShodanResult,
  type RadioReceiver,
  type APTGroup,
} from '@/lib/osint-feeds'

const layerGroups: { category: string; layers: { id: string; name: string; color: string; icon: ComponentType<any> }[] }[] = [
  {
    category: 'Live Intelligence',
    layers: [
      { id: 'acled', name: 'Conflict Events (ACLED)', color: '#DC2626', icon: Siren },
      { id: 'earthquakes', name: 'Seismic Activity (USGS)', color: '#F59E0B', icon: Activity },
      { id: 'fires', name: 'Fire Hotspots (NASA FIRMS)', color: '#EF4444', icon: Fire },
    ]
  },
  {
    category: 'Strategic Assets',
    layers: [
      { id: 'pmf', name: 'PMF Bases & Routes', color: '#D4A843', icon: ShieldCheck },
      { id: 'oil', name: 'Oil Infrastructure', color: '#C9A84C', icon: GasPump },
    ]
  },
  {
    category: 'Geopolitical',
    layers: [
      { id: 'disputed', name: 'Disputed Territories (Art. 140)', color: '#3A5A7C', icon: MapTrifold },
    ]
  },
  {
    category: 'Space & Air',
    layers: [
      { id: 'satellites', name: 'Orbital Satellites (SGP4)', color: '#4FC3F7', icon: RocketLaunch },
      { id: 'aircraft', name: 'Live Air Traffic (ADS-B)', color: '#FFA726', icon: AirplaneTilt },
    ]
  },
  {
    category: 'Maritime Intel',
    layers: [
      { id: 'carriers', name: 'USN Carrier Strike Groups', color: '#EF5350', icon: Anchor },
      { id: 'navalbases', name: 'Naval Installations', color: '#78909C', icon: Boat },
    ]
  },
  {
    category: 'Cyber & Signals',
    layers: [
      { id: 'apt', name: 'APT Threat Groups (57)', color: '#F43F5E', icon: NavigationArrow },
      { id: 'shodan', name: 'Exposed Infra (Shodan)', color: '#10B981', icon: Binoculars },
      { id: 'radio', name: 'WebSDR Receivers', color: '#8B5CF6', icon: Broadcast },
      { id: 'cctv', name: 'CCTV Public Mesh', color: '#14B8A6', icon: SecurityCamera },
    ]
  },
  {
    category: 'Environmental',
    layers: [
      { id: 'climate', name: 'Climate-Security Matrix', color: '#2DD4BF', icon: Thermometer },
    ]
  }
]

// Static conflict points (always displayed)
const CONFLICT_POINTS = [
  { lat: 33.3, lng: 44.4, label: 'Baghdad — High Alert', severity: 'critical', color: '#DC2626' },
  { lat: 36.34, lng: 43.13, label: 'Mosul — Safe Zone', severity: 'low', color: '#22c55e' },
  { lat: 35.47, lng: 44.39, label: 'Kirkuk — Dynamic Escalation', severity: 'critical', color: '#DC2626' },
  { lat: 34.55, lng: 43.68, label: 'Makhmur — Journalist Caution', severity: 'high', color: '#f59e0b' },
  { lat: 36.41, lng: 41.87, label: 'Sinjar — Corridor Open', severity: 'medium', color: '#3b82f6' },
  { lat: 31.99, lng: 44.37, label: 'Dhi Qar — Checkpoint', severity: 'medium', color: '#eab308' },
  { lat: 30.51, lng: 47.78, label: 'Basra — Secure Transit', severity: 'low', color: '#22c55e' },
]

// ── Magnitude → Color mapping for earthquakes ───────────────────

function quakeColor(mag: number): string {
  if (mag >= 7) return '#DC2626'
  if (mag >= 5) return '#EA580C'
  if (mag >= 4) return '#EAB308'
  if (mag >= 3) return '#3B82F6'
  return '#6B7280'
}

function quakeSize(mag: number): number {
  if (mag >= 7) return 24
  if (mag >= 5) return 18
  if (mag >= 4) return 14
  return 10
}

// ── Component ───────────────────────────────────────────────────

export default function TerrainView() {
  const [activeLayers, setActiveLayers] = useState<string[]>(['acled', 'earthquakes'])
  const [selectedDossier, setSelectedDossier] = useState<RegionDossier | null>(null)
  const [selectedEntity, setSelectedEntity] = useState<any>(null)
  const [dossierLoading, setDossierLoading] = useState(false)

  // Live USGS earthquake feed
  const { data: earthquakes = [] } = useQuery({
    queryKey: ['earthquakes'],
    queryFn: () => fetchEarthquakes({ minMagnitude: 2.5, period: '1d' }),
    refetchInterval: 120_000,
    staleTime: 60_000,
  })

  // Live NASA FIRMS fire hotspots
  const { data: fires = [] } = useQuery({
    queryKey: ['fires'],
    queryFn: () => fetchFireHotspots(),
    refetchInterval: 300_000,
    staleTime: 120_000,
  })

  // Live Satellite positions (CelesTrak TLE + SGP4)
  const { data: satellites = [] } = useQuery({
    queryKey: ['satellites-terrain'],
    queryFn: () => fetchSatellitePositions({ groups: ['stations', 'gps-ops', 'military'], limit: 150 }),
    refetchInterval: 60_000,
    staleTime: 30_000,
  })

  // Carrier Strike Group positions
  const { data: carriers = [] } = useQuery({
    queryKey: ['carriers-terrain'],
    queryFn: () => fetchCarrierPositions(),
    refetchInterval: 600_000,
    staleTime: 300_000,
  })

  // Naval base locations
  const { data: navalBases = [] } = useQuery({
    queryKey: ['naval-bases'],
    queryFn: () => fetchNavalBases(),
    staleTime: Infinity,
  })

  // Live aircraft from OpenSky/adsb.lol
  const { data: aircraft = [] } = useQuery({
    queryKey: ['aircraft-terrain'],
    queryFn: () => fetchAircraft({ latMin: 23, latMax: 42, lngMin: 30, lngMax: 60 }),
    refetchInterval: 30_000,
    staleTime: 15_000,
  })

  // CCTV Cameras
  const { data: cctvCameras = [] } = useQuery({
    queryKey: ['cctv-terrain'],
    queryFn: () => fetchCCTVCameras(),
    staleTime: Infinity,
  })

  // Shodan Industrial/Exposed Infra
  const { data: shodanData } = useQuery({
    queryKey: ['shodan-terrain'],
    queryFn: () => fetchShodanResults('port:502'),
    staleTime: 600_000,
  })
  const shodanAssets = shodanData?.results || []

  // WebSDR Receivers
  const { data: radioReceivers = [] } = useQuery({
    queryKey: ['radio-terrain'],
    queryFn: () => fetchRadioReceivers(),
    staleTime: Infinity,
  })

  // APT Threat Groups
  const { data: aptGroups = [] } = useQuery({
    queryKey: ['apt-groups'],
    queryFn: () => fetchAPTGroups(),
    staleTime: Infinity,
  })

  const toggleLayer = (id: string) => {
    setActiveLayers(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    )
  }

  // Region dossier on right-click (simulated with Iraq for now)
  const handleDossierLookup = async (code: string) => {
    setDossierLoading(true)
    const dossier = await fetchRegionDossier(code)
    setSelectedDossier(dossier)
    setDossierLoading(false)
  }

  return (
    <div className="relative w-full h-full animate-fade-in bg-deep-black">
      {/* Dynamic Warning Header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
        <div className="glass-card px-4 py-2 rounded-full flex items-center gap-3 shadow-lg">
          <RadioTower size={14} className="text-red-500 animate-pulse" />
          <span className="text-[11px] uppercase tracking-widest font-bold text-white">Live Multi-Source Intelligence Feed</span>
          <div className="flex items-center gap-2 ml-2 text-[10px] text-white/50 font-mono">
            <span className="flex items-center gap-1"><Activity size={10} className="text-yellow-500" /> {earthquakes.length} quakes</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Flame size={10} className="text-red-500" /> {fires.length} fires</span>
            {satellites.length > 0 && <><span>·</span><span className="flex items-center gap-1"><Satellite size={10} className="text-cyan-400" /> {satellites.length} sats</span></>}
            {carriers.length > 0 && <><span>·</span><span className="flex items-center gap-1"><Anchor size={10} className="text-red-400" /> {carriers.length} carriers</span></>}
          </div>
        </div>
      </div>

      {/* Map Content */}
      <div className="absolute inset-0 z-0">
        <Map center={[44.4, 33.3]} zoom={5.5} pitch={45}>
          <TerrainWebGLLayers 
             activeLayers={activeLayers}
             aircraft={aircraft}
             satellites={satellites}
             shodan={shodanAssets}
             cctv={cctvCameras}
             radio={radioReceivers}
             onSelect={setSelectedEntity}
          />

          {/* Conflict Events Layer — Siren icons */}
          {activeLayers.includes('acled') && CONFLICT_POINTS.map((pt, idx) => (
            <MapMarker key={`conflict-${idx}`} longitude={pt.lng} latitude={pt.lat}>
              <MarkerContent>
                <div
                  className="p-1.5 rounded-full border border-white/20 cursor-pointer hover:scale-125 transition-transform"
                  style={{ backgroundColor: pt.color, boxShadow: `0 0 16px ${pt.color}` }}
                  onClick={() => setSelectedEntity({
                    type: 'Conflict Event', title: pt.label, subtitle: pt.severity, props: pt
                  })}
                >
                  <Siren size={14} weight="fill" className="text-white" />
                </div>
                <MarkerLabel position="top" className="bg-black/90 px-2 py-1 rounded text-white border border-white/10 backdrop-blur-sm mt-1">
                  {pt.label}
                </MarkerLabel>
              </MarkerContent>
            </MapMarker>
          ))}

          {/* Carrier Strike Groups — Anchor icons */}
          {activeLayers.includes('carriers') && carriers.map((carrier, idx) => (
            <MapMarker key={`carrier-${idx}`} longitude={carrier.lng} latitude={carrier.lat}>
              <MarkerContent>
                <div className="bg-red-500 text-white p-1.5 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.7)] cursor-pointer hover:bg-white hover:text-red-500 transition-colors"
                     onClick={() => setSelectedEntity({
                        type: 'Carrier Strike Group', title: carrier.name, subtitle: carrier.class, props: carrier
                     })}>
                  <Anchor size={16} weight="bold" />
                </div>
                <MarkerLabel position="bottom" className="bg-black/90 text-[9px] px-1.5 rounded text-red-100 border border-red-500/30 mt-1">
                  {carrier.name} ({carrier.confidence})
                </MarkerLabel>
              </MarkerContent>
            </MapMarker>
          ))}

          {/* Naval Bases — Boat icons */}
          {activeLayers.includes('navalbases') && navalBases.map((base, idx) => (
            <MapMarker key={`base-${idx}`} longitude={base.lng} latitude={base.lat}>
              <MarkerContent>
                <div className="bg-slate-600/90 backdrop-blur-sm text-white p-1.5 border border-slate-400/50 rounded-lg shadow-md cursor-pointer hover:bg-slate-500 transition-colors"
                     onClick={() => setSelectedEntity({
                        type: 'Naval Installation', title: base.name, subtitle: base.region, props: base
                     })}>
                  <Boat size={14} weight="fill" />
                </div>
                <MarkerLabel position="right" className="bg-black/60 text-[8px] px-1 ml-1 rounded text-slate-300">
                  {base.name}
                </MarkerLabel>
              </MarkerContent>
            </MapMarker>
          ))}

          {/* LIVE Earthquake Layer — Pulse/Activity icons */}
          {activeLayers.includes('earthquakes') && earthquakes.map((eq) => (
            <MapMarker key={eq.id} longitude={eq.lng} latitude={eq.lat}>
              <MarkerContent>
                <div
                  className="rounded-lg border border-white/30 flex items-center gap-1 px-1.5 py-0.5 cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: quakeColor(eq.magnitude),
                    boxShadow: `0 0 ${eq.magnitude * 4}px ${quakeColor(eq.magnitude)}`,
                  }}
                  onClick={() => setSelectedEntity({
                    type: 'Seismic Event', title: `M${eq.magnitude.toFixed(1)}`, subtitle: eq.place, props: eq
                  })}
                >
                  <Activity size={12} weight="bold" className="text-white" />
                  <span className="text-[9px] font-bold text-white font-mono">{eq.magnitude.toFixed(1)}</span>
                </div>
                <MarkerLabel position="top" className="bg-black/90 px-2 py-1 rounded text-white border border-white/10 backdrop-blur-sm text-[10px]">
                  M{eq.magnitude.toFixed(1)} — {eq.place}
                </MarkerLabel>
              </MarkerContent>
            </MapMarker>
          ))}

          {/* LIVE Fire Hotspots Layer — Fire icons */}
          {activeLayers.includes('fires') && fires.map((fire, i) => (
            <MapMarker key={`fire-${i}`} longitude={fire.longitude} latitude={fire.latitude}>
              <MarkerContent>
                <div
                  className="p-1 rounded-full animate-pulse cursor-pointer"
                  style={{
                    backgroundColor: fire.frp > 30 ? '#DC2626' : fire.frp > 10 ? '#EA580C' : '#EAB308',
                    boxShadow: `0 0 ${8 + fire.frp * 0.3}px ${fire.frp > 30 ? '#DC2626' : '#EA580C'}`,
                  }}
                >
                  <Fire size={10} weight="fill" className="text-white" />
                </div>
              </MarkerContent>
            </MapMarker>
          ))}

          {/* APT Threat Groups — Bug icons */}
          {activeLayers.includes('apt') && aptGroups.map((apt) => (
            <MapMarker key={`apt-${apt.id}`} longitude={apt.lng} latitude={apt.lat}>
              <MarkerContent>
                <div
                  className="p-1.5 rounded-lg border cursor-pointer hover:scale-125 transition-transform"
                  style={{
                    backgroundColor: `${apt.color}22`,
                    borderColor: `${apt.color}66`,
                    boxShadow: `0 0 10px ${apt.color}44`,
                  }}
                  onClick={() => setSelectedEntity({
                    type: 'APT Threat Group', title: apt.name, subtitle: `Origin: ${apt.origin}`,
                    props: { ...apt, origin: apt.origin, targets: apt.targets, description: apt.description }
                  })}
                >
                  <NavigationArrow size={12} weight="fill" style={{ color: apt.color }} />
                </div>
                <MarkerLabel position="top" className="bg-black/90 px-2 py-1 rounded text-white border border-white/10 backdrop-blur-sm text-[9px]">
                  {apt.name}
                </MarkerLabel>
              </MarkerContent>
            </MapMarker>
          ))}

          {/* PMF Routes */}
          {activeLayers.includes('pmf') && (
            <>
               <MapRoute coordinates={[[44.4, 33.3], [43.13, 36.34]]} color="#3b82f6" width={3} />
               <MapRoute coordinates={[[44.4, 33.3], [47.78, 30.51]]} color="#22c55e" width={3} />
               <MapRoute coordinates={[[44.4, 33.3], [44.39, 35.47]]} color="#DC2626" width={4} dashArray={[2, 2]} />
            </>
          )}
        </Map>
      </div>

      {/* Legend overlays */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10 w-56">
          <h4 className="text-[10px] uppercase font-bold text-white/50 mb-2 border-b border-white/10 pb-1">Live Data Sources</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> Secure Corridor
            </div>
            <div className="flex items-center gap-2 text-xs text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></span> USGS Earthquakes
            </div>
            <div className="flex items-center gap-2 text-xs text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(234,88,12,0.6)]"></span> NASA FIRMS Fires
            </div>
            <div className="flex items-center gap-2 text-xs text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(220,38,38,0.6)] animate-pulse"></span> Hostile Zone
            </div>
          </div>
        </div>
        
        {/* Region Dossier Button */}
        <div className="pointer-events-auto">
          <button
            onClick={() => handleDossierLookup('IQ')}
            className="w-full px-3 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-[10px] text-white/70 hover:text-gold hover:border-gold/30 transition-all flex items-center gap-2"
          >
            <Globe2 size={12} />
            <span className="font-bold tracking-wide uppercase">Region Intel Dossier</span>
          </button>
        </div>
      </div>

      {/* Layer control panel */}
      <div className="absolute top-4 left-4 w-72 z-50">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-subtle">
            <Layers size={14} className="text-gold" />
            <h2 className="text-[11px] font-bold tracking-[0.15em] text-white uppercase">Terrain Overlays</h2>
            <span className="ml-auto text-[9px] text-green-400 font-mono animate-pulse">● LIVE</span>
          </div>
          <div className="space-y-4">
            {layerGroups.map((group, gi) => (
              <div key={gi}>
                <div className="text-[9px] text-text-tertiary uppercase tracking-[0.2em] mb-2 font-semibold">
                  {group.category}
                </div>
                <div className="space-y-1">
                  {group.layers.map((layer) => {
                    const isActive = activeLayers.includes(layer.id)
                    const LayerIcon = layer.icon
                    return (
                      <button
                        key={layer.id}
                        onClick={() => toggleLayer(layer.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                          isActive ? 'bg-surface-hover' : 'hover:bg-surface-elevated'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <LayerIcon
                            size={14}
                            weight={isActive ? 'fill' : 'regular'}
                            style={{ color: isActive ? layer.color : '#6B7280' }}
                          />
                          <span className={`text-[11px] font-medium ${isActive ? 'text-white' : 'text-text-secondary'}`}>
                            {layer.name}
                          </span>
                        </div>
                        <div className={`w-3 h-3 rounded-sm border flex items-center justify-center transition-colors ${
                          isActive ? 'bg-gold border-gold' : 'border-text-tertiary'
                        }`}>
                          {isActive && <div className="w-1.5 h-1.5 bg-black rounded-sm" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Viewport stats — now live */}
        <div className="glass-card p-3 mt-3">
          <h3 className="text-[9px] text-text-tertiary uppercase tracking-[0.15em] mb-2 font-semibold">Live Telemetry</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-surface border border-border rounded-lg">
              <span className="block text-[8px] text-text-muted uppercase">Conflicts</span>
              <span className="block text-sm font-mono text-alert-red font-bold">{CONFLICT_POINTS.length}</span>
            </div>
            <div className="p-2 bg-surface border border-border rounded-lg">
              <span className="block text-[8px] text-text-muted uppercase">Quakes</span>
              <span className="block text-sm font-mono text-yellow-500 font-bold">{earthquakes.length}</span>
            </div>
            <div className="p-2 bg-surface border border-border rounded-lg">
              <span className="block text-[8px] text-text-muted uppercase">Fires</span>
              <span className="block text-sm font-mono text-orange-500 font-bold">{fires.length}</span>
            </div>
              <div className="p-2 bg-surface border border-border rounded-lg">
              <span className="block text-[8px] text-text-muted uppercase">Satellites</span>
              <span className="block text-sm font-mono text-cyan-400 font-bold">{satellites.length}</span>
            </div>
            <div className="p-2 bg-surface border border-border rounded-lg">
              <span className="block text-[8px] text-text-muted uppercase">Aircraft</span>
              <span className="block text-sm font-mono text-orange-400 font-bold">{aircraft.length}</span>
            </div>
            <div className="p-2 bg-surface border border-border rounded-lg">
              <span className="block text-[8px] text-text-muted uppercase">Carriers</span>
              <span className="block text-sm font-mono text-red-400 font-bold">{carriers.length}</span>
            </div>
            <div className="p-2 bg-surface border border-border rounded-lg">
              <span className="block text-[8px] text-text-muted uppercase">Sensors</span>
              <span className="block text-sm font-mono text-teal-400 font-bold">{cctvCameras.length + shodanAssets.length + radioReceivers.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Region Dossier Panel */}
      {selectedDossier && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="absolute top-4 right-4 w-80 z-50 glass-card p-5 max-h-[80vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe2 size={16} className="text-gold" />
              <span className="text-xs font-bold tracking-[0.1em] text-gold uppercase">Region Dossier</span>
            </div>
            <button onClick={() => setSelectedDossier(null)} className="text-white/40 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            {selectedDossier.flag && (
              <img src={selectedDossier.flag} alt="Flag" className="w-12 h-8 rounded shadow-lg object-cover" />
            )}
            <div>
              <h3 className="text-lg font-bold text-white">{selectedDossier.name}</h3>
              <p className="text-xs text-text-muted">{selectedDossier.subregion}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="p-2 bg-surface-elevated rounded-lg border border-border">
              <span className="text-[8px] text-text-muted uppercase block">Capital</span>
              <span className="text-xs font-medium text-white">{selectedDossier.capital}</span>
            </div>
            <div className="p-2 bg-surface-elevated rounded-lg border border-border">
              <span className="text-[8px] text-text-muted uppercase block">Population</span>
              <span className="text-xs font-medium text-white">{(selectedDossier.population / 1_000_000).toFixed(1)}M</span>
            </div>
            <div className="p-2 bg-surface-elevated rounded-lg border border-border">
              <span className="text-[8px] text-text-muted uppercase block">Area</span>
              <span className="text-xs font-medium text-white">{selectedDossier.area.toLocaleString()} km²</span>
            </div>
            <div className="p-2 bg-surface-elevated rounded-lg border border-border">
              <span className="text-[8px] text-text-muted uppercase block">Region</span>
              <span className="text-xs font-medium text-white">{selectedDossier.region}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[9px] text-text-muted uppercase tracking-wider block mb-1">Languages</span>
              <div className="flex flex-wrap gap-1">
                {selectedDossier.languages.map(l => (
                  <span key={l} className="text-[10px] text-white/80 bg-white/5 border border-white/10 px-2 py-0.5 rounded">{l}</span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[9px] text-text-muted uppercase tracking-wider block mb-1">Currencies</span>
              <div className="flex flex-wrap gap-1">
                {selectedDossier.currencies.map(c => (
                  <span key={c} className="text-[10px] text-white/80 bg-white/5 border border-white/10 px-2 py-0.5 rounded">{c}</span>
                ))}
              </div>
            </div>
            {selectedDossier.wikiSummary && (
              <div>
                <span className="text-[9px] text-text-muted uppercase tracking-wider block mb-1">Intelligence Summary</span>
                <p className="text-xs text-text-secondary leading-relaxed">{selectedDossier.wikiSummary.slice(0, 400)}...</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Selected Entity Intel Panel */}
      {selectedEntity && (
        <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute top-4 right-4 w-80 z-50 glass-card p-5 max-h-[80vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crosshair size={16} className="text-cyan-400" />
              <span className="text-xs font-bold tracking-[0.1em] text-cyan-400 uppercase">Target Dossier</span>
            </div>
            <button onClick={() => setSelectedEntity(null)} className="text-white/40 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <div className="mb-4 pb-4 border-b border-white/5">
            <h3 className="text-lg font-bold text-white">{selectedEntity.title || 'Unknown Target'}</h3>
            <p className="text-xs font-mono text-cyan-400 mt-1 uppercase">CLASS: {selectedEntity.type}</p>
            {selectedEntity.subtitle && <p className="text-xs text-text-muted mt-1">{selectedEntity.subtitle}</p>}
          </div>

          {selectedEntity.props && (
             <div className="space-y-2">
               {Object.entries(selectedEntity.props).map(([k, v]: [string, any]) => (
                 v !== null && v !== undefined && k !== 'title' && k !== 'type' && (
                   <div key={k} className="flex flex-col bg-surface-elevated p-2 rounded border border-white/5">
                     <span className="text-[9px] uppercase tracking-wider text-text-muted mb-1">{k.replace(/_/g, ' ')}</span>
                     <span className="text-xs font-mono text-white break-all">{String(v)}</span>
                   </div>
                 )
               ))}
             </div>
          )}
        </motion.div>
      )}

      {/* Center crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 opacity-15">
        <Crosshair size={36} className="text-gold" strokeWidth={1} />
      </div>
    </div>
  )
}
