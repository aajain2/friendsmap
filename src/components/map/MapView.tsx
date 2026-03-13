'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { fetchAllUsers } from '@/lib/supabase';
import { createMapStyle } from '@/lib/mapStyle';
import type { UserEntry, TimePeriod } from '@/types';
import TimePeriodToggle from './TimePeriodToggle';
import PeoplePanel from './PeoplePanel';

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

// Small jitter to separate co-located users
function jitter(base: number, index: number): number {
  const seed = Math.sin(index * 12.9898) * 43758.5453;
  return base + (seed - Math.floor(seed) - 0.5) * 0.03;
}

function buildGeoJSON(users: UserEntry[], period: TimePeriod): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: users.map((user, i) => {
      const loc = getLocationForPeriod(user, period);
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
        },
      };
    }),
  };
}

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [period, setPeriod] = useState<TimePeriod>('summer');
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  // Fetch users once
  useEffect(() => {
    fetchAllUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const style = createMapStyle();

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style,
      center: [-40, 30],
      zoom: 1.8,
      minZoom: 1,
      maxZoom: 16,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

    map.on('load', () => {
      // Add people data source
      map.addSource('people', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Glow layer (larger, blurred) — hand-drawn ink bleed effect
      map.addLayer({
        id: 'people-glow',
        type: 'circle',
        source: 'people',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            1, 10,
            4, 14,
            8, 20,
            12, 28,
          ],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.2,
          'circle-blur': 1,
        },
      });

      // Main node layer — hand-drawn dot feel
      map.addLayer({
        id: 'people-nodes',
        type: 'circle',
        source: 'people',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            1, 4,
            4, 6,
            8, 9,
            12, 13,
          ],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.9,
          'circle-stroke-width': [
            'interpolate', ['linear'], ['zoom'],
            1, 1,
            8, 2,
          ],
          'circle-stroke-color': '#f5f0eb',
        },
      });

      // Inner dot (gives a hand-drawn target/pin feel)
      map.addLayer({
        id: 'people-inner',
        type: 'circle',
        source: 'people',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            1, 1.5,
            4, 2,
            8, 3,
            12, 4,
          ],
          'circle-color': '#f5f0eb',
          'circle-opacity': 0.8,
        },
      });

      // Name labels (visible at higher zoom)
      map.addLayer({
        id: 'people-labels',
        type: 'symbol',
        source: 'people',
        minzoom: 4,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Semibold'],
          'text-size': [
            'interpolate', ['linear'], ['zoom'],
            4, 10,
            8, 12,
          ],
          'text-offset': [0, -1.6],
          'text-anchor': 'bottom',
          'text-allow-overlap': false,
          'text-padding': 8,
        },
        paint: {
          'text-color': '#2B2B23',
          'text-halo-color': 'rgba(245, 240, 235, 0.95)',
          'text-halo-width': 2,
        },
      });

      mapRef.current = map;
    });

    // Hover interactions
    const tooltip = tooltipRef.current;

    map.on('mouseenter', 'people-nodes', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'people-nodes', () => {
      map.getCanvas().style.cursor = '';
      if (tooltip) tooltip.style.display = 'none';
    });

    map.on('mousemove', 'people-nodes', (e) => {
      if (!tooltip || !e.features || e.features.length === 0) return;
      const props = e.features[0].properties;
      if (!props) return;

      const name = props.name;
      const city = props.city;
      const activity = props.activity;
      const color = props.color;

      tooltip.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></div>
          <span style="font-family:'Instrument Serif',Georgia,serif;font-size:15px;font-weight:400;">${name}</span>
        </div>
        <div style="font-size:12px;color:rgba(43,43,35,0.6);padding-left:16px;">
          ${city}${activity ? ` · ${activity}` : ''}
        </div>
      `;

      tooltip.style.display = 'block';
      tooltip.style.left = `${e.point.x + 12}px`;
      tooltip.style.top = `${e.point.y - 12}px`;
    });

    // Click on node to fly to it
    map.on('click', 'people-nodes', (e) => {
      if (!e.features || e.features.length === 0) return;
      const coords = (e.features[0].geometry as GeoJSON.Point).coordinates;
      map.flyTo({ center: [coords[0], coords[1]], zoom: Math.max(map.getZoom(), 6), duration: 1200 });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update data when period or users change
  const updateData = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const source = map.getSource('people') as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(buildGeoJSON(users, period));
    }
  }, [users, period]);

  useEffect(() => {
    updateData();
    const map = mapRef.current;
    if (map) {
      map.on('styledata', updateData);
      return () => { map.off('styledata', updateData); };
    }
  }, [updateData]);

  const handleUserUpdated = useCallback((updated: UserEntry) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }, []);

  const handleFlyTo = useCallback((lng: number, lat: number) => {
    const map = mapRef.current;
    if (map) {
      map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 6), duration: 1200 });
    }
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Map */}
      <div ref={mapContainer} className="map-vintage w-full h-full" />

      {/* Paper texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Sketch grain overlay — adds hand-drawn texture feel */}
      <div
        className="absolute inset-0 pointer-events-none z-10 mix-blend-multiply"
        style={{
          opacity: 0.02,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.5' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* People panel */}
      <PeoplePanel
        users={users}
        period={period}
        collapsed={panelCollapsed}
        onToggleCollapse={() => setPanelCollapsed((c) => !c)}
        onUserUpdated={handleUserUpdated}
        onFlyTo={handleFlyTo}
      />

      {/* Header bar */}
      <div
        className="absolute top-0 z-20 flex items-center justify-between px-6 py-4 transition-all duration-300"
        style={{ left: panelCollapsed ? 0 : 320, right: 0 }}
      >
        <h1
          className="text-xl tracking-tight"
          style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
        >
          Friends Map
        </h1>
        <TimePeriodToggle active={period} onChange={setPeriod} />
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute z-40 hidden rounded-xl border border-[#2B2B23]/10 bg-[#f5f0eb]/95 backdrop-blur-sm px-3 py-2 shadow-md pointer-events-none"
        style={{ maxWidth: 220 }}
      />

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#f5f0eb]/90">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-[#c45c4c]/30 border-t-[#c45c4c] rounded-full animate-spin mb-3" />
            <p className="text-sm text-[#2B2B23]/50 tracking-wide">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
