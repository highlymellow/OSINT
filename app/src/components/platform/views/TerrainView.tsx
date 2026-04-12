import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import {
  Layers, Crosshair, Activity, Thermometer, Radar,
  Play, Pause, MapPin
} from 'lucide-react'

const layerGroups = [
  {
    category: 'Strategic Assets',
    layers: [
      { id: 'acled', name: 'Conflict Events (ACLED)', color: '#DC2626' },
      { id: 'pmf', name: 'PMF Bases', color: '#D4A843' },
      { id: 'oil', name: 'Oil Infrastructure', color: '#C9A84C' },
    ]
  },
  {
    category: 'Geopolitical',
    layers: [
      { id: 'disputed', name: 'Disputed Territories (Art. 140)', color: '#3A5A7C' },
    ]
  },
  {
    category: 'Environmental',
    layers: [
      { id: 'climate', name: 'Climate-Security Matrix', color: '#2DD4BF' },
      { id: 'satellite', name: 'Satellite Change Detection', color: '#F0F0F0' },
    ]
  }
]

// Simulated conflict points
const CONFLICT_POINTS = [
  { lat: 33.3, lng: 44.4, label: 'Baghdad — PMF Budget Dispute', severity: 'high' },
  { lat: 36.34, lng: 43.13, label: 'Mosul — Shabak Protests', severity: 'medium' },
  { lat: 35.47, lng: 44.39, label: 'Kirkuk — Property Seizures', severity: 'critical' },
  { lat: 34.55, lng: 43.68, label: 'Makhmur — Peshmerga-ISF Standoff', severity: 'critical' },
  { lat: 36.41, lng: 41.87, label: 'Sinjar — Yazidi Return Blocked', severity: 'high' },
  { lat: 31.99, lng: 44.37, label: 'Dhi Qar — Marshland Drought', severity: 'medium' },
  { lat: 30.51, lng: 47.78, label: 'Basra — Mandaean Harassment', severity: 'medium' },
]

export default function TerrainView() {
  const [activeLayers, setActiveLayers] = useState<string[]>(['acled'])
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const [timelineVal, setTimelineVal] = useState(100)
  const [isPlaying, setIsPlaying] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  const toggleLayer = (id: string) => {
    setActiveLayers(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    )
  }

  // Load Leaflet
  useEffect(() => {
    // Check if L is already available globally
    if ((window as any).L) {
      setMapReady(true)
      return
    }

    // Add CSS if not present
    if (!document.querySelector('link[href*="leaflet"]')) {
      const css = document.createElement('link')
      css.rel = 'stylesheet'
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(css)
    }

    // Add JS if not present
    if (!document.querySelector('script[src*="leaflet"]')) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => setMapReady(true)
      document.head.appendChild(script)
    } else {
      // Script tag exists but L not ready yet, poll for it
      const poll = setInterval(() => {
        if ((window as any).L) {
          clearInterval(poll)
          setMapReady(true)
        }
      }, 100)
      return () => clearInterval(poll)
    }
  }, [])

  // Init map
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const L = (window as any).L
    if (!L || leafletMapRef.current) return

    leafletMapRef.current = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([33.3, 44.4], 6)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      maxZoom: 18
    }).addTo(leafletMapRef.current)

    L.control.zoom({ position: 'topright' }).addTo(leafletMapRef.current)

    // Fix container sizing
    setTimeout(() => {
      leafletMapRef.current?.invalidateSize()
    }, 300)

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [mapReady])

  // Sync layers
  useEffect(() => {
    const L = (window as any).L
    if (!leafletMapRef.current || !L) return

    if ((leafletMapRef.current as any)._customGroup) {
      leafletMapRef.current.removeLayer((leafletMapRef.current as any)._customGroup)
    }

    const group = L.layerGroup();
    (leafletMapRef.current as any)._customGroup = group

    if (activeLayers.includes('acled')) {
      CONFLICT_POINTS.forEach((pt) => {
        const color = pt.severity === 'critical' ? '#DC2626' : pt.severity === 'high' ? '#EA580C' : '#EAB308'
        const radius = pt.severity === 'critical' ? 12 : pt.severity === 'high' ? 9 : 6
        L.circleMarker([pt.lat, pt.lng], {
          color, fillColor: color, fillOpacity: 0.4, radius, weight: 1.5
        }).bindPopup(`<div style="font-family:Inter;font-size:12px;"><strong>${pt.label}</strong><br/><span style="text-transform:uppercase;font-size:10px;color:${color}">${pt.severity}</span></div>`)
          .addTo(group)
      })
    }

    if (activeLayers.includes('pmf')) {
      [[32.0, 45.4], [31.0, 46.0], [33.8, 44.8]].forEach(([lat, lng]) => {
        L.circleMarker([lat, lng], { color: '#D4A843', fillColor: '#D4A843', fillOpacity: 0.5, radius: 8, weight: 1 }).addTo(group)
      })
    }

    if (activeLayers.includes('oil')) {
      [[30.5, 47.7], [35.4, 44.3], [36.2, 44.0]].forEach(([lat, lng]) => {
        L.circleMarker([lat, lng], { color: '#C9A84C', fillColor: '#C9A84C', fillOpacity: 0.7, radius: 6, weight: 1 }).addTo(group)
      })
    }

    group.addTo(leafletMapRef.current)
  }, [activeLayers, mapReady])

  return (
    <div className="relative w-full h-full animate-fade-in bg-deep-black">
      {/* Map container */}
      <div ref={mapRef} className="absolute inset-0 w-full h-full z-0" style={{ filter: 'contrast(1.1) brightness(1.05)' }} />

      {/* Layer control panel */}
      <div className="absolute top-4 left-4 w-72 z-50">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-subtle">
            <Layers size={14} className="text-gold" />
            <h2 className="text-[11px] font-bold tracking-[0.15em] text-white uppercase">Terrain Overlays</h2>
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
                    return (
                      <button
                        key={layer.id}
                        onClick={() => toggleLayer(layer.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                          isActive ? 'bg-surface-hover' : 'hover:bg-surface-elevated'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: isActive ? layer.color : '#4B5563' }} />
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

        {/* Viewport stats */}
        <div className="glass-card p-3 mt-3">
          <h3 className="text-[9px] text-text-tertiary uppercase tracking-[0.15em] mb-2 font-semibold">Viewport Analytics</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-surface border border-border rounded-lg">
              <span className="block text-[8px] text-text-muted uppercase">Events</span>
              <span className="block text-sm font-mono text-alert-red font-bold">142</span>
            </div>
            <div className="p-2 bg-surface border border-border rounded-lg">
              <span className="block text-[8px] text-text-muted uppercase">Density</span>
              <span className="block text-sm font-mono text-gold font-bold">HIGH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Satellite timeline */}
      {activeLayers.includes('satellite') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[700px] z-50"
        >
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Radar size={14} className="text-gold" />
              <span className="text-[11px] font-medium text-white">Satellite Change Detection Matrix</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </button>
              <div className="flex-1">
                <input
                  type="range"
                  min="0" max="100"
                  value={timelineVal}
                  onChange={(e) => setTimelineVal(Number(e.target.value))}
                  className="w-full h-1 bg-surface-hover rounded-full appearance-none outline-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #C9A84C ${timelineVal}%, #2A2A30 ${timelineVal}%)`
                  }}
                />
                <div className="flex justify-between text-[9px] text-text-muted mt-1">
                  <span>6 months prior</span>
                  <span className="text-gold">Today</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Center crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 opacity-15">
        <Crosshair size={36} className="text-gold" strokeWidth={1} />
      </div>
    </div>
  )
}
