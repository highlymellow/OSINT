import { useEffect } from 'react';
import { useMap } from '@/components/ui/map';
import type { Aircraft, Satellite, ShodanResult, CCTVCamera, RadioReceiver } from '@/lib/osint-feeds';

type Props = {
  activeLayers: string[];
  aircraft: Aircraft[];
  satellites: Satellite[];
  shodan: ShodanResult[];
  cctv: CCTVCamera[];
  radio: RadioReceiver[];
  onSelect?: (entity: any) => void;
};

// ── SVG Icon Renderer ───────────────────────────────────────────
// Renders an SVG path string onto a Canvas and returns ImageData
// that MapLibre can register as a custom icon image.
function createIconImage(
  svgPath: string,
  color: string,
  size: number = 32,
  strokeColor?: string
): ImageData {
  const canvas = document.createElement('canvas');
  const ratio = window.devicePixelRatio || 1;
  canvas.width = size * ratio;
  canvas.height = size * ratio;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(ratio, ratio);

  // Draw the SVG path scaled to our icon size
  const path = new Path2D(svgPath);

  // Add a subtle glow behind the icon
  ctx.shadowColor = color;
  ctx.shadowBlur = 4;

  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 0.8;
    ctx.stroke(path);
  }

  ctx.fillStyle = color;
  ctx.fill(path);

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// ── Icon SVG Paths (32x32 viewBox) ──────────────────────────────
// Each path is designed for a 32×32 coordinate space.

// Airplane silhouette pointing up
const AIRCRAFT_PATH = `
  M16 2 L14 8 L6 14 L6 17 L14 14 L14 22 L11 25 L11 27 L16 25 L21 27 L21 25
  L18 22 L18 14 L26 17 L26 14 L18 8 Z
`;

// Satellite with solar panels
const SATELLITE_PATH = `
  M12 4 L8 4 L8 10 L12 10 Z
  M20 4 L24 4 L24 10 L20 10 Z
  M14 6 L18 6 L19 8 L19 14 L21 16 L19 18 L18 16 L14 16 L13 18 L11 16 L13 14 L13 8 Z
  M14 18 L18 18 L18 24 L14 24 Z
  M12 22 L8 22 L8 28 L12 28 Z
  M20 22 L24 22 L24 28 L20 28 Z
`;

// Server/terminal icon for Shodan
const SERVER_PATH = `
  M6 4 L26 4 L26 12 L6 12 Z
  M9 6.5 A1 1 0 1 0 9 8.5 A1 1 0 1 0 9 6.5
  M13 7 L23 7 L23 9 L13 9 Z
  M6 14 L26 14 L26 22 L6 22 Z
  M9 16.5 A1 1 0 1 0 9 18.5 A1 1 0 1 0 9 16.5
  M13 17 L23 17 L23 19 L13 19 Z
  M14 24 L18 24 L18 28 L14 28 Z
`;

// Security camera
const CCTV_PATH = `
  M8 10 L22 6 L24 10 L24 16 L22 20 L8 16 Z
  M6 11 L8 10 L8 16 L6 15 Z
  M24 12 L28 10 L28 16 L24 14 Z
  M14 20 L18 20 L18 26 L14 26 Z
  M10 26 L22 26 L22 28 L10 28 Z
`;

// Radio antenna / broadcast tower
const RADIO_PATH = `
  M15 6 L17 6 L17 20 L15 20 Z
  M10 10 A8 8 0 0 1 16 4
  M22 10 A8 8 0 0 0 16 4
  M7 14 A12 12 0 0 1 16 2
  M25 14 A12 12 0 0 0 16 2
  M12 22 L20 22 L22 28 L10 28 Z
`;

// ── Registration Helper ─────────────────────────────────────────
function registerIcons(map: any) {
  const icons: [string, string, string, number][] = [
    ['icon-aircraft',  AIRCRAFT_PATH,  '#FFA726', 32],
    ['icon-aircraft-mil', AIRCRAFT_PATH, '#EF4444', 32],
    ['icon-satellite', SATELLITE_PATH, '#4FC3F7', 32],
    ['icon-shodan',    SERVER_PATH,    '#10B981', 32],
    ['icon-cctv',      CCTV_PATH,     '#14B8A6', 32],
    ['icon-radio',     RADIO_PATH,    '#8B5CF6', 32],
  ];

  icons.forEach(([name, path, color, size]) => {
    if (!map.hasImage(name)) {
      const ratio = window.devicePixelRatio || 1;
      const img = createIconImage(path, color, size);
      map.addImage(name, img, { pixelRatio: ratio, sdf: false });
    }
  });
}

export function TerrainWebGLLayers({ activeLayers, aircraft, satellites, shodan, cctv, radio, onSelect }: Props) {
  const { map, isLoaded } = useMap();

  // ── Layer + Source Setup ─────────────────────────────────────
  useEffect(() => {
    if (!map || !isLoaded) return;

    // Register custom icon images on the map
    registerIcons(map);

    const sources = ['aircraft', 'satellites', 'shodan', 'cctv', 'radio'];
    
    sources.forEach(src => {
      if (!map.getSource(src)) {
        map.addSource(src, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
      }
    });

    // ── Aircraft: symbol layer with airplane icon ──────────────
    if (!map.getLayer('aircraft-layer')) {
      map.addLayer({
        id: 'aircraft-layer',
        type: 'symbol',
        source: 'aircraft',
        layout: {
          'icon-image': ['case', ['get', 'is_military'], 'icon-aircraft-mil', 'icon-aircraft'],
          'icon-size': ['case', ['get', 'is_military'], 0.7, 0.5],
          'icon-rotate': ['coalesce', ['get', 'heading'], 0],
          'icon-rotation-alignment': 'map',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });
    }

    // ── Satellites: symbol layer with satellite icon ────────────
    if (!map.getLayer('satellites-layer')) {
      map.addLayer({
        id: 'satellites-layer',
        type: 'symbol',
        source: 'satellites',
        layout: {
          'icon-image': 'icon-satellite',
          'icon-size': 0.45,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });
    }

    // ── Shodan: symbol layer with server icon ──────────────────
    if (!map.getLayer('shodan-layer')) {
      map.addLayer({
        id: 'shodan-layer',
        type: 'symbol',
        source: 'shodan',
        layout: {
          'icon-image': 'icon-shodan',
          'icon-size': 0.5,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });
    }

    // ── CCTV: symbol layer with camera icon ────────────────────
    if (!map.getLayer('cctv-layer')) {
      map.addLayer({
        id: 'cctv-layer',
        type: 'symbol',
        source: 'cctv',
        layout: {
          'icon-image': 'icon-cctv',
          'icon-size': 0.45,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });
    }

    // ── Radio: symbol layer with antenna icon ──────────────────
    if (!map.getLayer('radio-layer')) {
      map.addLayer({
        id: 'radio-layer',
        type: 'symbol',
        source: 'radio',
        layout: {
          'icon-image': 'icon-radio',
          'icon-size': 0.55,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });
    }

    // ── Interaction Handlers ───────────────────────────────────
    const layers = ['aircraft-layer', 'satellites-layer', 'shodan-layer', 'cctv-layer', 'radio-layer'];
    
    const clickHandler = (e: any) => {
      if (!onSelect || !e.features || e.features.length === 0) return;
      const feature = e.features[0];
      if (feature.properties) {
          let props = feature.properties.props;
          if (typeof props === 'string') {
              try { props = JSON.parse(props); } catch(err) {}
          }
          
          onSelect({
              id: feature.properties.id,
              type: feature.properties.type,
              title: feature.properties.title,
              subtitle: feature.properties.subtitle,
              props: props || feature.properties
          });
      }
    };

    const mouseEnter = () => { map.getCanvas().style.cursor = 'crosshair'; };
    const mouseLeave = () => { map.getCanvas().style.cursor = 'default'; };

    layers.forEach(l => {
        map.on('click', l, clickHandler);
        map.on('mouseenter', l, mouseEnter);
        map.on('mouseleave', l, mouseLeave);
    });

    return () => {
      if (map) {
         layers.forEach(l => {
             map.off('click', l, clickHandler);
             map.off('mouseenter', l, mouseEnter);
             map.off('mouseleave', l, mouseLeave);
         });
         try {
            ['aircraft', 'satellites', 'shodan', 'cctv', 'radio'].forEach(l => {
               if (map.getLayer(`${l}-layer`)) map.removeLayer(`${l}-layer`);
               if (map.getSource(l)) map.removeSource(l);
            });
         } catch (e) {}
      }
    };
  }, [map, isLoaded, onSelect]);

  // ── Data Updates ─────────────────────────────────────────────
  useEffect(() => {
    if (!map || !isLoaded) return;

    // Aircraft
    if (activeLayers.includes('aircraft')) {
      const src: any = map.getSource('aircraft');
      if (src) {
        src.setData({
          type: 'FeatureCollection',
          features: aircraft.map(a => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [a.lng, a.lat] },
            properties: { 
                is_military: a.is_military, 
                heading: a.heading || 0,
                type: 'Aircraft',
                title: a.callsign || a.id,
                subtitle: a.owner || a.type,
                props: JSON.stringify(a)
            }
          }))
        });
      }
    } else {
      const src: any = map.getSource('aircraft');
      if (src) src.setData({ type: 'FeatureCollection', features: [] });
    }

    // Satellites
    if (activeLayers.includes('satellites')) {
        const src: any = map.getSource('satellites');
        if (src) {
            src.setData({
                type: 'FeatureCollection',
                features: satellites.map(s => ({
                  type: 'Feature',
                  geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
                  properties: {
                      type: 'Satellite/Orbital',
                      title: s.name,
                      subtitle: s.group_label || s.group,
                      props: JSON.stringify(s)
                  }
                }))
            });
        }
    } else {
        const src: any = map.getSource('satellites');
        if (src) src.setData({ type: 'FeatureCollection', features: [] });
    }

    // Shodan
    if (activeLayers.includes('shodan')) {
        const src: any = map.getSource('shodan');
        if (src) {
            src.setData({
                type: 'FeatureCollection',
                features: shodan.filter(s => s.lat && s.lng).map(s => ({
                  type: 'Feature',
                  geometry: { type: 'Point', coordinates: [s.lng!, s.lat!] },
                  properties: {
                      type: 'SCADA / Exposed Infra',
                      title: s.ip,
                      subtitle: s.org,
                      props: JSON.stringify(s)
                  }
                }))
            });
        }
    } else {
        const src: any = map.getSource('shodan');
        if (src) src.setData({ type: 'FeatureCollection', features: [] });
    }

    // CCTV
    if (activeLayers.includes('cctv')) {
        const src: any = map.getSource('cctv');
        if (src) {
            src.setData({
                type: 'FeatureCollection',
                features: cctv.map(s => ({
                  type: 'Feature',
                  geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
                  properties: {
                      type: 'CCTV Camera Node',
                      title: s.name,
                      subtitle: s.country,
                      props: JSON.stringify(s)
                  }
                }))
            });
        }
    } else {
        const src: any = map.getSource('cctv');
        if (src) src.setData({ type: 'FeatureCollection', features: [] });
    }

    // Radio
    if (activeLayers.includes('radio')) {
        const src: any = map.getSource('radio');
        if (src) {
            src.setData({
                type: 'FeatureCollection',
                features: radio.map(s => ({
                  type: 'Feature',
                  geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
                  properties: {
                      type: 'Radio Intercept Node (SDR)',
                      title: s.name,
                      subtitle: s.country,
                      props: JSON.stringify(s)
                  }
                }))
            });
        }
    } else {
        const src: any = map.getSource('radio');
        if (src) src.setData({ type: 'FeatureCollection', features: [] });
    }

  }, [activeLayers, aircraft, satellites, shodan, cctv, radio, map, isLoaded]);

  return null;
}
