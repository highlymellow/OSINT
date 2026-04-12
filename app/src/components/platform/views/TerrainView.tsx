import { useState } from 'react'
import { motion } from 'motion/react'
import {
  Layers, Crosshair, Radio, Radar,
  Play, Pause
} from 'lucide-react'
import {
  Map,
  MapMarker,
  MarkerContent,
  MapRoute,
  MarkerLabel,
} from "@/components/ui/map"
import { Badge } from '@/components/ui/badge'

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

// Simulated conflict points and dynamic nodes
const CONFLICT_POINTS = [
  { lat: 33.3, lng: 44.4, label: 'Baghdad — High Alert', severity: 'critical', color: '#DC2626' },
  { lat: 36.34, lng: 43.13, label: 'Mosul — Safe Zone', severity: 'low', color: '#22c55e' },
  { lat: 35.47, lng: 44.39, label: 'Kirkuk — Dynamic Escalation', severity: 'critical', color: '#DC2626' },
  { lat: 34.55, lng: 43.68, label: 'Makhmur — Journalist Caution', severity: 'high', color: '#f59e0b' },
  { lat: 36.41, lng: 41.87, label: 'Sinjar — Corridor Open', severity: 'medium', color: '#3b82f6' },
  { lat: 31.99, lng: 44.37, label: 'Dhi Qar — Checkpoint', severity: 'medium', color: '#eab308' },
  { lat: 30.51, lng: 47.78, label: 'Basra — Secure Transit', severity: 'low', color: '#22c55e' },
]

export default function TerrainView() {
  const [activeLayers, setActiveLayers] = useState<string[]>(['acled'])
  const [timelineVal, setTimelineVal] = useState(100)
  const [isPlaying, setIsPlaying] = useState(false)

  const toggleLayer = (id: string) => {
    setActiveLayers(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    )
  }

  return (
    <div className="relative w-full h-full animate-fade-in bg-deep-black">
      {/* Dynamic Warning Header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
        <div className="glass-card px-4 py-2 rounded-full flex items-center gap-3 shadow-lg">
          <Radio size={14} className="text-red-500 animate-pulse" />
          <span className="text-[11px] uppercase tracking-widest font-bold text-white">Live Journalist Security Spectrum</span>
        </div>
      </div>

      {/* Map Content */}
      <div className="absolute inset-0 z-0">
        <Map
          center={[44.4, 33.3]}
          zoom={5.5}
          pitch={45}
        >
          {activeLayers.includes('acled') && CONFLICT_POINTS.map((pt, idx) => (
            <MapMarker key={idx} longitude={pt.lng} latitude={pt.lat}>
              <MarkerContent>
                <div
                  className="size-4 rounded-full border-2 border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.5)] animate-pulse"
                  style={{ backgroundColor: pt.color, boxShadow: `0 0 20px ${pt.color}` }}
                />
                <MarkerLabel position="top" className="bg-black/90 px-2 py-1 rounded text-white border border-white/10 backdrop-blur-sm mt-1">
                  {pt.label}
                </MarkerLabel>
              </MarkerContent>
            </MapMarker>
          ))}

          {/* Dynamic Simulated Roads/Vectors leading to conflict zones */}
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
        <div className="bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10 w-48">
          <h4 className="text-[10px] uppercase font-bold text-white/50 mb-2 border-b border-white/10 pb-1">Safety Index</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> Secure Corridor
            </div>
            <div className="flex items-center gap-2 text-xs text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span> Verified Node
            </div>
            <div className="flex items-center gap-2 text-xs text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></span> Checkpoint C1
            </div>
            <div className="flex items-center gap-2 text-xs text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(220,38,38,0.6)] animate-pulse"></span> Hostile Zone
            </div>
          </div>
        </div>
      </div>

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

      {/* Center crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 opacity-15">
        <Crosshair size={36} className="text-gold" strokeWidth={1} />
      </div>
    </div>
  )
}
