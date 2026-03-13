'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { fetchAllUsers } from '@/lib/supabase';
import { createMapStyle } from '@/lib/mapStyle';
import type { UserEntry, TimePeriod } from '@/types';
import TimePeriodToggle from './TimePeriodToggle';
import PeoplePanel from './PeoplePanel';

const PERIODS: TimePeriod[] = ['summer', 'year1', 'year2'];
const PERIOD_LABELS: Record<TimePeriod, string> = {
  summer: 'Summer 2026',
  year1: '2026-2027',
  year2: '2027-2028',
};

function getLocationForPeriod(user: UserEntry, period: TimePeriod) {
  switch (period) {
    case 'summer':
      return { city: user.summer_city, lat: user.summer_lat, lng: user.summer_lng, activity: user.summer_activity };
    case 'year1':
      return { city: user.year1_city, lat: user.year1_lat, lng: user.year1_lng, activity: user.year1_activity };
    case 'year2':
      return { city: user.year2_city, lat: user.year2_lat, lng: user.year2_lng, activity: user.year2_activity };
  }
}

function jitter(base: number, index: number): number {
  const seed = Math.sin(index * 12.9898) * 43758.5453;
  return base + (seed - Math.floor(seed) - 0.5) * 0.04;
}

function generateInitialImage(color: string, initial: string, size: number = 80): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}"/>
    <circle cx="${size/2 - 6}" cy="${size/2 - 6}" r="${size * 0.18}" fill="white" opacity="0.12"/>
    <text x="${size/2}" y="${size/2 + 1}" text-anchor="middle" dominant-baseline="central"
      font-family="Helvetica Neue, Arial, sans-serif" font-weight="600" font-size="${size * 0.38}"
      fill="white" letter-spacing="-0.5">${initial}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function buildGeoJSON(users: UserEntry[], period: TimePeriod, selectedIds: Set<string>): GeoJSON.FeatureCollection {
  // If some people are selected, only show those; if none selected, show all
  const filtered = selectedIds.size > 0 ? users.filter((u) => selectedIds.has(u.id!)) : users;
  return {
    type: 'FeatureCollection',
    features: filtered.map((user, i) => {
      const loc = getLocationForPeriod(user, period);
      const initial = user.name.charAt(0).toUpperCase();
      const iconId = `initial-${initial}-${user.node_color.replace('#', '')}`;
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [jitter(loc.lng, i), jitter(loc.lat, i * 7)],
        },
        properties: {
          id: user.id || '',
          name: user.name,
          city: loc.city,
          activity: loc.activity || '',
          color: user.node_color,
          icon: iconId,
        },
      };
    }),
  };
}

// Smoothly interpolate between two GeoJSON feature collections over time
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function interpolateGeoJSON(
  from: GeoJSON.FeatureCollection,
  to: GeoJSON.FeatureCollection,
  t: number,
): GeoJSON.FeatureCollection {
  // Match features by id
  const toMap = new Map<string, GeoJSON.Feature>();
  to.features.forEach((f) => toMap.set(f.properties?.id, f));
  const fromMap = new Map<string, GeoJSON.Feature>();
  from.features.forEach((f) => fromMap.set(f.properties?.id, f));

  // All unique ids
  const allIds = new Set([...fromMap.keys(), ...toMap.keys()]);
  const features: GeoJSON.Feature[] = [];

  allIds.forEach((id) => {
    const fFrom = fromMap.get(id);
    const fTo = toMap.get(id);
    if (fFrom && fTo) {
      const coordsFrom = (fFrom.geometry as GeoJSON.Point).coordinates;
      const coordsTo = (fTo.geometry as GeoJSON.Point).coordinates;
      features.push({
        ...fTo,
        geometry: {
          type: 'Point',
          coordinates: [lerp(coordsFrom[0], coordsTo[0], t), lerp(coordsFrom[1], coordsTo[1], t)],
        },
      });
    } else if (fTo) {
      features.push(fTo);
    } else if (fFrom) {
      features.push(fFrom);
    }
  });

  return { type: 'FeatureCollection', features };
}

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [period, setPeriod] = useState<TimePeriod>('summer');
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState<Set<string>>(new Set());
  const playingRef = useRef(false);
  const loadedImagesRef = useRef<Set<string>>(new Set());
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    fetchAllUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const registerImages = useCallback((map: maplibregl.Map, userList: UserEntry[]) => {
    userList.forEach((user) => {
      const initial = user.name.charAt(0).toUpperCase();
      const iconId = `initial-${initial}-${user.node_color.replace('#', '')}`;
      if (loadedImagesRef.current.has(iconId)) return;
      const img = new Image(80, 80);
      img.onload = () => {
        if (!map.hasImage(iconId)) map.addImage(iconId, img, { sdf: false });
        loadedImagesRef.current.add(iconId);
      };
      img.src = generateInitialImage(user.node_color, initial, 80);
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: createMapStyle(),
      center: [-40, 30],
      zoom: 1.8,
      minZoom: 1,
      maxZoom: 16,
    });

    // Also set sky at runtime to ensure atmosphere is off
    map.on('style.load', () => {
      try {
        map.setSky({
          'sky-color': '#f0e8de',
          'sky-horizon-blend': 0,
          'horizon-color': '#f0e8de',
          'horizon-fog-blend': 0,
          'fog-color': '#f0e8de',
          'fog-ground-blend': 0,
          'atmosphere-blend': 0,
        });
      } catch {
        // ignore if not supported
      }
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

    map.on('load', () => {
      map.addSource('people', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Outer glow — shrinks as you zoom in
      map.addLayer({
        id: 'people-glow-outer',
        type: 'circle',
        source: 'people',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 28, 4, 22, 8, 14, 12, 8, 16, 5],
          'circle-color': ['get', 'color'],
          'circle-opacity': ['interpolate', ['linear'], ['zoom'], 1, 0.08, 8, 0.05, 14, 0.03],
          'circle-blur': 1,
        },
      });

      // Inner glow — shrinks as you zoom in
      map.addLayer({
        id: 'people-glow',
        type: 'circle',
        source: 'people',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 18, 4, 14, 8, 10, 12, 6, 16, 4],
          'circle-color': ['get', 'color'],
          'circle-opacity': ['interpolate', ['linear'], ['zoom'], 1, 0.14, 8, 0.08, 14, 0.04],
          'circle-blur': 0.5,
        },
      });

      // Icon layer — shrinks as you zoom in
      map.addLayer({
        id: 'people-icons',
        type: 'symbol',
        source: 'people',
        layout: {
          'icon-image': ['get', 'icon'],
          'icon-size': ['interpolate', ['linear'], ['zoom'], 1, 0.5, 4, 0.42, 8, 0.32, 12, 0.22, 16, 0.15],
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });

      // Name labels
      map.addLayer({
        id: 'people-labels',
        type: 'symbol',
        source: 'people',
        minzoom: 3,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 3, 10, 6, 12, 10, 14],
          'text-offset': [0, 2.4],
          'text-anchor': 'top',
          'text-allow-overlap': false,
          'text-padding': 8,
        },
        paint: {
          'text-color': '#2B2B23',
          'text-halo-color': 'rgba(240, 232, 222, 0.95)',
          'text-halo-width': 2,
        },
      });

      mapRef.current = map;
    });

    // Hover/click
    const tooltip = tooltipRef.current;
    ['people-icons', 'people-glow'].forEach((layer) => {
      map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', layer, () => {
        map.getCanvas().style.cursor = '';
        if (tooltip) tooltip.style.display = 'none';
      });
      map.on('mousemove', layer, (e) => {
        if (!tooltip || !e.features?.length) return;
        const p = e.features[0].properties!;
        tooltip.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">
            <div style="width:10px;height:10px;border-radius:50%;background:${p.color};box-shadow:0 0 6px ${p.color}40;"></div>
            <span style="font-family:'Instrument Serif',Georgia,serif;font-size:16px;">${p.name}</span>
          </div>
          <div style="font-size:12px;color:rgba(43,43,35,0.55);padding-left:18px;">
            ${p.city}${p.activity ? ` · ${p.activity}` : ''}
          </div>`;
        tooltip.style.display = 'block';
        tooltip.style.left = `${e.point.x + 14}px`;
        tooltip.style.top = `${e.point.y - 14}px`;
      });
    });

    map.on('click', 'people-icons', (e) => {
      if (!e.features?.length) return;
      const coords = (e.features[0].geometry as GeoJSON.Point).coordinates;
      map.flyTo({ center: [coords[0], coords[1]], zoom: Math.max(map.getZoom(), 6), duration: 1200 });
    });

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Update data when period, users, or selection changes
  const updateData = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    registerImages(map, users);
    const source = map.getSource('people') as maplibregl.GeoJSONSource | undefined;
    if (source) source.setData(buildGeoJSON(users, period, selectedPeople));
  }, [users, period, selectedPeople, registerImages]);

  useEffect(() => {
    updateData();
    const map = mapRef.current;
    if (map) {
      map.on('styledata', updateData);
      return () => { map.off('styledata', updateData); };
    }
  }, [updateData]);

  // Smooth animated transition between periods
  const animateTransition = useCallback((fromPeriod: TimePeriod, toPeriod: TimePeriod, onComplete: () => void) => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) { onComplete(); return; }

    const source = map.getSource('people') as maplibregl.GeoJSONSource | undefined;
    if (!source) { onComplete(); return; }

    const fromGeo = buildGeoJSON(users, fromPeriod, selectedPeople);
    const toGeo = buildGeoJSON(users, toPeriod, selectedPeople);
    const duration = 1800; // ms
    const start = performance.now();

    function step(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // Ease in-out cubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      source!.setData(interpolateGeoJSON(fromGeo, toGeo, eased));

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        onComplete();
      }
    }

    animFrameRef.current = requestAnimationFrame(step);
  }, [users, selectedPeople]);

  // Play animation
  const playAnimation = useCallback(async () => {
    if (playingRef.current || users.length === 0) return;
    playingRef.current = true;
    setIsPlaying(true);
    const map = mapRef.current;
    if (!map) { playingRef.current = false; setIsPlaying(false); return; }

    const visibleUsers = selectedPeople.size > 0
      ? users.filter((u) => selectedPeople.has(u.id!))
      : users;

    // Compute overall center
    const allCoords: [number, number][] = [];
    visibleUsers.forEach((u) => {
      PERIODS.forEach((p) => {
        const loc = getLocationForPeriod(u, p);
        allCoords.push([loc.lng, loc.lat]);
      });
    });
    const avgLng = allCoords.reduce((s, c) => s + c[0], 0) / allCoords.length;
    const avgLat = allCoords.reduce((s, c) => s + c[1], 0) / allCoords.length;

    // Start zoomed out
    map.flyTo({ center: [avgLng, avgLat], zoom: 2, duration: 1500, essential: true });
    await sleep(1800);

    for (let i = 0; i < PERIODS.length; i++) {
      if (!playingRef.current) break;
      const prevPeriod = i === 0 ? PERIODS[0] : PERIODS[i - 1];
      const nextPeriod = PERIODS[i];

      // Animate dots sliding to new positions
      await new Promise<void>((resolve) => {
        animateTransition(prevPeriod, nextPeriod, resolve);
      });
      setPeriod(nextPeriod);

      // Fly to this period's center
      const periodCoords = visibleUsers.map((u) => getLocationForPeriod(u, nextPeriod));
      const pLng = periodCoords.reduce((s, c) => s + c.lng, 0) / periodCoords.length;
      const pLat = periodCoords.reduce((s, c) => s + c.lat, 0) / periodCoords.length;

      map.flyTo({ center: [pLng, pLat], zoom: 3.5, duration: 2000, essential: true });
      await sleep(3000);
    }

    // Zoom back out
    if (playingRef.current) {
      map.flyTo({ center: [avgLng, avgLat], zoom: 1.8, duration: 1500, essential: true });
    }

    playingRef.current = false;
    setIsPlaying(false);
  }, [users, selectedPeople, animateTransition]);

  const stopAnimation = useCallback(() => {
    playingRef.current = false;
    setIsPlaying(false);
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  const handleUserUpdated = useCallback((updated: UserEntry) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }, []);

  const handleFlyTo = useCallback((lng: number, lat: number) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom: Math.max(mapRef.current.getZoom(), 6), duration: 1200 });
  }, []);

  // Toggle selection of a person
  const togglePersonSelection = useCallback((userId: string) => {
    setSelectedPeople((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPeople(new Set());
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#f0e8de]">
      <div ref={mapContainer} className="map-vintage w-full h-full" />

      {/* Paper grain */}
      <div className="absolute inset-0 pointer-events-none z-10 paper-grain" />

      {/* People panel */}
      <PeoplePanel
        users={users}
        period={period}
        collapsed={panelCollapsed}
        onToggleCollapse={() => setPanelCollapsed((c) => !c)}
        onUserUpdated={handleUserUpdated}
        onFlyTo={handleFlyTo}
        selectedPeople={selectedPeople}
        onToggleSelect={togglePersonSelection}
        onClearSelection={clearSelection}
      />

      {/* Header */}
      <div
        className="absolute top-0 z-20 flex items-center justify-between px-6 py-4 transition-all duration-300"
        style={{ left: panelCollapsed ? 60 : 320, right: 0 }}
      >
        <h1
          className="text-xl tracking-tight"
          style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
        >
          Friends Map
        </h1>

        <div className="flex items-center gap-2">
          <TimePeriodToggle active={period} onChange={setPeriod} />
          <button
            onClick={isPlaying ? stopAnimation : playAnimation}
            disabled={users.length === 0}
            className={`w-9 h-9 rounded-full flex items-center justify-center border active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed ${
              isPlaying
                ? 'bg-[#d44a3a] border-[#d44a3a] text-white shadow-lg'
                : 'bg-white/80 backdrop-blur-sm border-[#2B2B23]/10 text-[#2B2B23]/60 hover:text-[#2B2B23] hover:border-[#2B2B23]/20 hover:shadow-md'
            }`}
            style={{ transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            title={isPlaying ? 'Stop' : 'Play timeline'}
          >
            {isPlaying ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <rect x="1" y="1" width="4" height="10" rx="1" />
                <rect x="7" y="1" width="4" height="10" rx="1" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M2.5 1.5L10.5 6L2.5 10.5V1.5Z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Period label during animation */}
      {isPlaying && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 animate-fade-in-scale">
          <div className="rounded-full bg-[#2B2B23]/85 backdrop-blur-md px-6 py-2.5 text-sm text-[#f0e8de] tracking-wide shadow-xl">
            {PERIOD_LABELS[period]}
          </div>
        </div>
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute z-40 hidden rounded-2xl border border-[#2B2B23]/6 bg-[#f5f0eb]/96 backdrop-blur-xl px-4 py-3 shadow-xl pointer-events-none"
        style={{ maxWidth: 240, transition: 'opacity 0.15s ease, transform 0.15s ease' }}
      />

      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#f0e8de]">
          <div className="text-center animate-fade-in">
            <div
              className="inline-block w-8 h-8 border-2 border-[#d44a3a]/20 border-t-[#d44a3a] rounded-full mb-3"
              style={{ animation: 'spin-smooth 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}
            />
            <p className="text-sm text-[#2B2B23]/35 tracking-wide">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
