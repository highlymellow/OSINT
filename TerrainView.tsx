"use client";

import React, { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast";
import { Layers, Crosshair, Map as MapIcon, ChevronRight, Activity, Thermometer, Radar, Play, Pause, Rewind, FastForward } from "lucide-react";

const layerGroups = [
  {
    category: "Strategic Assets",
    layers: [
      { id: "acled", name: "Conflict Events (ACLED)", icon: <Activity size={12}/>, color: "var(--color-alert-red)" },
      { id: "pmf", name: "PMF Bases", icon: <Crosshair size={12}/>, color: "var(--color-amber)" },
      { id: "oil", name: "Oil Infrastructure", icon: <MapIcon size={12}/>, color: "var(--color-gold)" },
    ]
  },
  {
    category: "Geopolitical",
    layers: [
      { id: "disputed", name: "Disputed Territories (Art. 140)", icon: <MapIcon size={12}/>, color: "var(--color-steel-blue)" },
    ]
  },
  {
    category: "Environmental",
    layers: [
      { id: "climate", name: "Climate-Security Matrix", icon: <Thermometer size={12}/>, color: "var(--color-teal)" },
      { id: "satellite", name: "Satellite Change Detection", icon: <Radar size={12}/>, color: "var(--color-text-primary)" },
    ]
  }
];

export default function TerrainView() {
  const { toast } = useToast();
  const [activeLayers, setActiveLayers] = useState<string[]>(["acled"]);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const [timelineVal, setTimelineVal] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleLayer = (id: string) => {
    setActiveLayers(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
    if (id === "satellite") {
      toast("Activating SAR / Satellite Change Detection Matrix.", "info");
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (!leafletMapRef.current) {
      // Initialize full bleed
      leafletMapRef.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([33.3152, 44.3661], 6);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(leafletMapRef.current);
    }
  }, []);

  // Sync Leaflet Layers to UI Toggle State
  useEffect(() => {
    const L = (window as any).L;
    if (!leafletMapRef.current || !L) return;
    
    // Clear existing mock layers properly
    if ((leafletMapRef.current as any)._customLayerGroup) {
      leafletMapRef.current.removeLayer((leafletMapRef.current as any)._customLayerGroup);
    }
    
    const layerGroup = L.layerGroup();
    (leafletMapRef.current as any)._customLayerGroup = layerGroup;

    if (activeLayers.includes("acled")) {
      L.circleMarker([33.3, 44.4], { color: '#d0021b', radius: 8, fillOpacity: 0.5 }).addTo(layerGroup);
      L.circleMarker([34.5, 43.6], { color: '#d0021b', radius: 12, fillOpacity: 0.5 }).addTo(layerGroup);
      L.circleMarker([36.3, 43.1], { color: '#d0021b', radius: 5, fillOpacity: 0.5 }).addTo(layerGroup);
    }
    if (activeLayers.includes("pmf")) {
      L.circleMarker([32.0, 45.4], { color: '#f5a623', radius: 10, fillOpacity: 0.7 }).addTo(layerGroup);
      L.circleMarker([31.0, 46.0], { color: '#f5a623', radius: 15, fillOpacity: 0.7 }).addTo(layerGroup);
    }
    if (activeLayers.includes("oil")) {
      L.circleMarker([30.5, 47.7], { color: '#f8e71c', radius: 6, fillOpacity: 0.9 }).addTo(layerGroup);
      L.circleMarker([35.4, 44.3], { color: '#f8e71c', radius: 9, fillOpacity: 0.9 }).addTo(layerGroup);
    }

    layerGroup.addTo(leafletMapRef.current);
  }, [activeLayers]);

  return (
    <div className="relative w-full h-full animate-fade-in bg-[var(--color-deep-black)]">
      
      {/* FULL SCREEN MAP (Z-0) */}
      <div 
        ref={mapRef} 
        className="absolute inset-0 w-full h-full z-0" 
        style={{ filter: "contrast(1.1) brightness(1.1)" }}
      />
      
      {/* ── FLOATING: LAYER CONTROL PANEL (Left) ── */}
      <div className="absolute top-6 left-6 w-[320px] z-50 flex flex-col gap-4">
        
        <div className="glass-card p-4 border-[var(--color-border)] shadow-2xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--color-border-subtle)]">
            <Layers className="text-[var(--color-gold)]" size={16}/>
            <h2 className="text-[11px] font-bold tracking-[0.15em] text-white">TERRAIN OVERLAYS</h2>
          </div>

          <div className="space-y-6">
            {layerGroups.map((group, i) => (
              <div key={i}>
                <div className="text-[9px] text-[var(--color-text-tertiary)] uppercase tracking-[0.2em] mb-2 pl-1 font-semibold">
                  {group.category}
                </div>
                <div className="space-y-1">
                  {group.layers.map(layer => {
                    const isActive = activeLayers.includes(layer.id);
                    return (
                      <button
                        key={layer.id}
                        onClick={() => toggleLayer(layer.id)}
                        className={`w-full flex items-center justify-between p-2 rounded transition-all duration-300 ${
                          isActive ? "bg-[var(--color-surface-hover)] shadow-inner" : "hover:bg-[var(--color-surface-elevated)]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span style={{ color: isActive ? layer.color : "var(--color-text-tertiary)" }}>
                            {layer.icon}
                          </span>
                          <span className={`text-[12px] font-medium tracking-wide ${isActive ? "text-white" : "text-[var(--color-text-secondary)]"}`}>
                            {layer.name}
                          </span>
                        </div>
                        <div className={`w-3 h-3 rounded-sm border flex items-center justify-center transition-colors ${
                          isActive ? "bg-[var(--color-gold)] border-[var(--color-gold)]" : "border-[var(--color-text-tertiary)]"
                        }`}>
                          {isActive && <div className="w-1.5 h-1.5 bg-black rounded-sm" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Quick Stats Overlay in Map */}
        <div className="glass-card p-4 border border-[var(--color-border-subtle)]">
          <h3 className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-[0.1em] mb-3">Viewport IQ Analytics</h3>
           <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
                <span className="block text-[9px] text-[var(--color-text-secondary)] uppercase">ACLED Events</span>
                <span className="block text-sm font-mono text-[var(--color-alert-red)] font-bold">142</span>
              </div>
              <div className="p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
                <span className="block text-[9px] text-[var(--color-text-secondary)] uppercase">Troop Density</span>
                <span className="block text-sm font-mono text-[var(--color-gold)] font-bold">HIGH</span>
              </div>
           </div>
        </div>
      </div>

      {/* ── FLOATING: SATELLITE CHANGE DETECTION TIMELINE ── */}
      {activeLayers.includes("satellite") && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[800px] z-50 animate-fade-in">
          <div className="bg-[var(--color-surface)] p-5 flex flex-col gap-4 border border-[var(--color-border)] rounded-xl shadow-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-[12px] font-medium tracking-wide text-white flex items-center gap-2">
                <Radar size={14} className="text-[var(--color-gold)]" />
                Satellite Change Detection Matrix
              </h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded bg-[var(--color-amber)]" />
                  <span className="text-[9px] text-[var(--color-text-secondary)] uppercase">Construction Flagged</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded bg-[var(--color-alert-red)]" />
                  <span className="text-[9px] text-[var(--color-text-secondary)] uppercase">Destruction Flagged</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 shrink-0 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-black transition-all"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-1" />}
              </button>

              <div className="flex-1 relative flex flex-col justify-center">
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={timelineVal} 
                  onChange={(e) => setTimelineVal(Number(e.target.value))}
                  className="w-full h-1 bg-[var(--color-surface-hover)] rounded-full appearance-none outline-none z-10 cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--color-gold) ${timelineVal}%, var(--color-border-subtle) ${timelineVal}%)`
                  }}
                />
                <div className="flex justify-between text-[10px] text-[var(--color-text-tertiary)] mt-3">
                  <span>6 months prior</span>
                  <span className="text-[var(--color-gold)]">Today</span>
                </div>
              </div>
            </div>
            {timelineVal < 50 && (
              <div className="absolute top-[-50px] left-[40%] bg-[var(--color-surface)] border border-[var(--color-border)] p-2 rounded shadow-md pointer-events-none">
                <p className="text-[10px] font-mono text-[var(--color-text-secondary)]"><span className="text-[var(--color-alert-red)] font-bold">DETECT:</span> Village clearance (-148 structures)</p>
              </div>
            )}
            {timelineVal > 60 && timelineVal < 90 && (
              <div className="absolute top-[-50px] left-[70%] bg-[var(--color-surface)] border border-[var(--color-border)] p-2 rounded shadow-md pointer-events-none">
                <p className="text-[10px] font-mono text-[var(--color-text-secondary)]"><span className="text-[var(--color-amber)] font-bold">DETECT:</span> Berm construction + Trenching</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Crosshair Center Reticle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[40] opacity-20">
        <Crosshair size={40} className="text-[var(--color-gold)]" strokeWidth={1} />
      </div>

    </div>
  );
}
