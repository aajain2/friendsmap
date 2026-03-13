import type { StyleSpecification } from 'maplibre-gl';

export function createMapStyle(): StyleSpecification {
  return {
    version: 8,
    name: 'Friends Map',
    projection: { type: 'globe' },
    sources: {
      openmaptiles: {
        type: 'vector',
        url: 'https://tiles.openfreemap.org/planet',
      },
    },
    // Disable atmosphere halo entirely so no crescent shows
    sky: {
      'sky-color': '#f0e8de',
      'sky-horizon-blend': 0,
      'horizon-color': '#f0e8de',
      'horizon-fog-blend': 0,
      'fog-color': '#f0e8de',
      'fog-ground-blend': 0,
      'atmosphere-blend': 0,
    } as StyleSpecification['sky'],
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    layers: [
      // Background — cream paper
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': '#f0e8de' },
      },

      // Water
      {
        id: 'water',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'water',
        paint: { 'fill-color': '#d6dfe4', 'fill-opacity': 0.7 },
      },

      // Subtle landcover
      {
        id: 'landcover-grass',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landcover',
        filter: ['==', 'class', 'grass'],
        paint: { 'fill-color': '#e8e2d6', 'fill-opacity': 0.3 },
      },
      {
        id: 'landcover-wood',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landcover',
        filter: ['==', 'class', 'wood'],
        paint: { 'fill-color': '#e2dcd0', 'fill-opacity': 0.25 },
      },

      // Parks
      {
        id: 'landuse-park',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landuse',
        filter: ['in', 'class', 'park', 'cemetery', 'pitch'],
        minzoom: 8,
        paint: { 'fill-color': '#e4ddd1', 'fill-opacity': 0.35 },
      },

      // === ROADS — Bold red ===
      {
        id: 'road-motorway-casing',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['all', ['==', 'class', 'motorway'], ['!=', 'brunnel', 'tunnel']],
        minzoom: 4,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#b8342a',
          'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 4, 0.8, 8, 3, 12, 7, 16, 14],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.3, 8, 0.7],
        },
      },
      {
        id: 'road-motorway',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['all', ['==', 'class', 'motorway'], ['!=', 'brunnel', 'tunnel']],
        minzoom: 4,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#d44a3a',
          'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 4, 0.4, 8, 1.5, 12, 4, 16, 9],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.3, 8, 0.8],
        },
      },
      {
        id: 'road-trunk',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['==', 'class', 'trunk'],
        minzoom: 6,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#d44a3a',
          'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 6, 0.4, 10, 2, 14, 5],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 6, 0.3, 10, 0.6],
        },
      },
      {
        id: 'road-primary',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['==', 'class', 'primary'],
        minzoom: 7,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#d44a3a',
          'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 7, 0.3, 10, 1.2, 14, 3.5],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0.25, 10, 0.55],
        },
      },
      {
        id: 'road-secondary',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['in', 'class', 'secondary', 'tertiary'],
        minzoom: 9,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#d44a3a',
          'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 9, 0.2, 12, 0.8, 16, 2.5],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 9, 0.2, 12, 0.4],
        },
      },
      {
        id: 'road-minor',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['in', 'class', 'minor', 'service', 'street'],
        minzoom: 12,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#d44a3a',
          'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 12, 0.2, 16, 1.2],
          'line-opacity': 0.25,
        },
      },

      // Rail
      {
        id: 'road-rail',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['==', 'class', 'rail'],
        minzoom: 10,
        paint: {
          'line-color': '#2B2B23',
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.4, 14, 1],
          'line-opacity': 0.2,
          'line-dasharray': [3, 3],
        },
      },

      // Waterways
      {
        id: 'waterway',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'waterway',
        minzoom: 7,
        paint: {
          'line-color': '#c0cfd8',
          'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.3, 12, 1.5],
          'line-opacity': 0.5,
        },
      },

      // === BOUNDARIES — dark ink ===
      {
        id: 'boundary-country',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'boundary',
        filter: ['==', 'admin_level', 2],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#2B2B23',
          'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.5, 3, 1, 6, 1.5, 10, 2],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 0, 0.3, 4, 0.5],
        },
      },
      {
        id: 'boundary-state',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'boundary',
        filter: ['==', 'admin_level', 4],
        minzoom: 3,
        paint: {
          'line-color': '#2B2B23',
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.2, 8, 0.6],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 3, 0.15, 6, 0.25],
          'line-dasharray': [5, 3],
        },
      },

      // === BUILDINGS — dark ink ===
      {
        id: 'building',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'building',
        minzoom: 13,
        paint: {
          'fill-color': '#e6dfd5',
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0.2, 16, 0.5],
          'fill-outline-color': '#2B2B23',
        },
      },
      {
        id: 'building-outline',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'building',
        minzoom: 14,
        paint: {
          'line-color': '#2B2B23',
          'line-width': 0.5,
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0.2, 16, 0.5],
        },
      },

      // === LABELS ===
      {
        id: 'label-water',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'water_name',
        minzoom: 2,
        layout: {
          'text-field': '{name:latin}',
          'text-font': ['Noto Sans Italic'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 2, 11, 6, 14],
          'text-letter-spacing': 0.25,
          'text-max-width': 8,
        },
        paint: {
          'text-color': '#8ba4b0',
          'text-opacity': 0.45,
          'text-halo-color': '#d6dfe4',
          'text-halo-width': 1.5,
        },
      },
      {
        id: 'label-country',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        filter: ['==', 'class', 'country'],
        minzoom: 1,
        maxzoom: 8,
        layout: {
          'text-field': '{name:latin}',
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 1, 10, 4, 14, 7, 18],
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.12,
          'text-max-width': 8,
          'text-padding': 4,
        },
        paint: {
          'text-color': '#2B2B23',
          'text-opacity': ['interpolate', ['linear'], ['zoom'], 1, 0.6, 5, 0.45, 8, 0.15],
          'text-halo-color': '#f0e8de',
          'text-halo-width': 2,
        },
      },
      {
        id: 'label-state',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        filter: ['==', 'class', 'state'],
        minzoom: 4,
        maxzoom: 10,
        layout: {
          'text-field': '{name:latin}',
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 4, 9, 7, 12],
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.08,
          'text-max-width': 8,
        },
        paint: {
          'text-color': '#6b6560',
          'text-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.4, 6, 0.5, 10, 0.2],
          'text-halo-color': '#f0e8de',
          'text-halo-width': 1.5,
        },
      },
      {
        id: 'label-city-major',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        filter: ['all', ['==', 'class', 'city'], ['<=', 'rank', 4]],
        minzoom: 3,
        layout: {
          'text-field': '{name:latin}',
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 3, 10, 7, 14, 11, 18],
          'text-max-width': 8,
          'text-padding': 6,
        },
        paint: {
          'text-color': '#2B2B23',
          'text-opacity': ['interpolate', ['linear'], ['zoom'], 3, 0.5, 6, 0.75],
          'text-halo-color': '#f0e8de',
          'text-halo-width': 1.5,
        },
      },
      {
        id: 'label-city',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        filter: ['all', ['==', 'class', 'city'], ['>', 'rank', 4]],
        minzoom: 5,
        layout: {
          'text-field': '{name:latin}',
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 5, 9, 9, 13],
          'text-max-width': 8,
          'text-padding': 4,
        },
        paint: {
          'text-color': '#2B2B23',
          'text-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0.4, 8, 0.65],
          'text-halo-color': '#f0e8de',
          'text-halo-width': 1.5,
        },
      },
      {
        id: 'label-town',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        filter: ['==', 'class', 'town'],
        minzoom: 8,
        layout: {
          'text-field': '{name:latin}',
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 8, 9, 12, 12],
          'text-max-width': 8,
        },
        paint: {
          'text-color': '#6b6560',
          'text-opacity': 0.55,
          'text-halo-color': '#f0e8de',
          'text-halo-width': 1,
        },
      },
      {
        id: 'label-village',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        filter: ['in', 'class', 'village', 'hamlet', 'suburb'],
        minzoom: 11,
        layout: {
          'text-field': '{name:latin}',
          'text-font': ['Noto Sans Regular'],
          'text-size': 10,
          'text-max-width': 8,
        },
        paint: {
          'text-color': '#8a847d',
          'text-opacity': 0.45,
          'text-halo-color': '#f0e8de',
          'text-halo-width': 1,
        },
      },
      {
        id: 'label-road',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'transportation_name',
        minzoom: 12,
        layout: {
          'text-field': '{name:latin}',
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 12, 9, 16, 12],
          'symbol-placement': 'line',
          'text-rotation-alignment': 'map',
        },
        paint: {
          'text-color': '#8a847d',
          'text-opacity': 0.55,
          'text-halo-color': '#f0e8de',
          'text-halo-width': 1,
        },
      },
    ],
  };
}
