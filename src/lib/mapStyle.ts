import type { StyleSpecification } from 'maplibre-gl';

// Hand-drawn aesthetic map style using OpenFreeMap vector tiles
// Cream paper background, red/coral accent lines, progressive labels
export function createMapStyle(): StyleSpecification {
  return {
    version: 8,
    name: 'Friends Map Hand-Drawn',
    // Globe projection for 3D when zoomed out
    projection: { type: 'globe' },
    sources: {
      openmaptiles: {
        type: 'vector',
        tiles: [
          'https://tiles.openfreemap.org/planet/{z}/{x}/{y}.pbf',
        ],
        maxzoom: 14,
        attribution:
          '&copy; <a href="https://openfreemap.org">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    },
    // Globe atmosphere styling
    sky: {
      'sky-color': '#f5f0eb',
      'sky-horizon-blend': 0.5,
      'horizon-color': '#e8ddd4',
      'horizon-fog-blend': 0.5,
      'fog-color': '#f5f0eb',
      'fog-ground-blend': 0.5,
    } as StyleSpecification['sky'],
    glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
    layers: [
      // Background — cream paper
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': '#f5f0eb',
        },
      },

      // Land cover — subtle warm tones
      {
        id: 'landcover-grass',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landcover',
        filter: ['==', 'class', 'grass'],
        paint: {
          'fill-color': '#ede7df',
          'fill-opacity': 0.4,
        },
      },
      {
        id: 'landcover-wood',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landcover',
        filter: ['==', 'class', 'wood'],
        paint: {
          'fill-color': '#e8e0d6',
          'fill-opacity': 0.3,
        },
      },

      // Water — soft blue-grey wash
      {
        id: 'water',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'water',
        paint: {
          'fill-color': '#d4dde2',
          'fill-opacity': 0.6,
        },
      },

      // Waterway lines
      {
        id: 'waterway',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'waterway',
        minzoom: 6,
        paint: {
          'line-color': '#c8d4da',
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            6, 0.5,
            12, 2,
          ],
          'line-opacity': 0.5,
        },
      },

      // Land use — parks, etc
      {
        id: 'landuse-park',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landuse',
        filter: ['in', 'class', 'park', 'cemetery'],
        minzoom: 8,
        paint: {
          'fill-color': '#e6ddd3',
          'fill-opacity': 0.3,
        },
      },

      // Country boundaries — bold red lines (the signature hand-drawn accent)
      {
        id: 'boundary-country',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'boundary',
        filter: ['==', 'admin_level', 2],
        paint: {
          'line-color': '#c45c4c',
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            0, 0.8,
            3, 1.5,
            6, 2.5,
            10, 3,
          ],
          'line-opacity': [
            'interpolate', ['linear'], ['zoom'],
            0, 0.7,
            6, 0.8,
          ],
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      },

      // State/province boundaries — thinner red dashed lines
      {
        id: 'boundary-state',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'boundary',
        filter: ['==', 'admin_level', 4],
        minzoom: 3,
        paint: {
          'line-color': '#c45c4c',
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            3, 0.3,
            6, 0.8,
            10, 1.2,
          ],
          'line-opacity': [
            'interpolate', ['linear'], ['zoom'],
            3, 0.3,
            6, 0.5,
          ],
          'line-dasharray': [4, 3],
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      },

      // Roads — red accent lines at higher zooms (like the illustration)
      {
        id: 'road-motorway',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['==', 'class', 'motorway'],
        minzoom: 5,
        paint: {
          'line-color': '#c45c4c',
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            5, 0.3,
            8, 1,
            12, 2.5,
            16, 5,
          ],
          'line-opacity': [
            'interpolate', ['linear'], ['zoom'],
            5, 0.2,
            8, 0.5,
            12, 0.6,
          ],
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      },
      {
        id: 'road-trunk',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['==', 'class', 'trunk'],
        minzoom: 7,
        paint: {
          'line-color': '#c45c4c',
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            7, 0.2,
            10, 0.8,
            14, 2,
          ],
          'line-opacity': 0.4,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      },
      {
        id: 'road-primary',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['==', 'class', 'primary'],
        minzoom: 8,
        paint: {
          'line-color': '#c45c4c',
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            8, 0.2,
            12, 1,
            16, 2,
          ],
          'line-opacity': 0.35,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      },
      {
        id: 'road-secondary',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['in', 'class', 'secondary', 'tertiary'],
        minzoom: 10,
        paint: {
          'line-color': '#c45c4c',
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            10, 0.1,
            14, 0.8,
            16, 1.5,
          ],
          'line-opacity': 0.25,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      },
      {
        id: 'road-minor',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['in', 'class', 'minor', 'service'],
        minzoom: 12,
        paint: {
          'line-color': '#c45c4c',
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            12, 0.1,
            16, 0.8,
          ],
          'line-opacity': 0.15,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      },

      // Buildings — dark outlines at high zoom (ink-drawn feel)
      {
        id: 'building',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'building',
        minzoom: 13,
        paint: {
          'fill-color': '#e8e0d6',
          'fill-opacity': [
            'interpolate', ['linear'], ['zoom'],
            13, 0.1,
            16, 0.3,
          ],
          'fill-outline-color': '#2B2B23',
        },
      },

      // === LABELS — Progressive zoom like Apple Find My ===

      // Country labels — visible from zoom 1
      {
        id: 'label-country',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        filter: ['==', 'class', 'country'],
        minzoom: 1,
        maxzoom: 7,
        layout: {
          'text-field': ['get', 'name:latin'],
          'text-font': ['Open Sans Bold'],
          'text-size': [
            'interpolate', ['linear'], ['zoom'],
            1, 10,
            3, 13,
            5, 16,
          ],
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.15,
          'text-max-width': 8,
          'text-allow-overlap': false,
          'text-padding': 2,
        },
        paint: {
          'text-color': '#2B2B23',
          'text-opacity': [
            'interpolate', ['linear'], ['zoom'],
            1, 0.7,
            4, 0.5,
            7, 0.2,
          ],
          'text-halo-color': '#f5f0eb',
          'text-halo-width': 2,
        },
      },

      // Continent/ocean labels
      {
        id: 'label-continent',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        filter: ['==', 'class', 'continent'],
        maxzoom: 3,
        layout: {
          'text-field': ['get', 'name:latin'],
          'text-font': ['Open Sans Bold'],
          'text-size': 14,
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.3,
        },
        paint: {
          'text-color': '#2B2B23',
          'text-opacity': 0.4,
          'text-halo-color': '#f5f0eb',
          'text-halo-width': 2,
        },
      },

      // State/province labels — visible from zoom 4
      {
        id: 'label-state',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        filter: ['==', 'class', 'state'],
        minzoom: 4,
        maxzoom: 9,
        layout: {
          'text-field': ['get', 'name:latin'],
          'text-font': ['Open Sans Regular'],
          'text-size': [
            'interpolate', ['linear'], ['zoom'],
            4, 9,
            6, 11,
            8, 13,
          ],
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.1,
          'text-max-width': 8,
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#6b6560',
          'text-opacity': [
            'interpolate', ['linear'], ['zoom'],
            4, 0.5,
            6, 0.6,
            9, 0.3,
          ],
          'text-halo-color': '#f5f0eb',
          'text-halo-width': 1.5,
        },
      },

      // City labels — capitals and major cities from zoom 4, others from zoom 6+
      {
        id: 'label-city-major',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        filter: [
          'all',
          ['==', 'class', 'city'],
          ['<=', 'rank', 4],
        ],
        minzoom: 3,
        layout: {
          'text-field': ['get', 'name:latin'],
          'text-font': ['Open Sans Semibold'],
          'text-size': [
            'interpolate', ['linear'], ['zoom'],
            3, 9,
            6, 12,
            10, 15,
          ],
          'text-max-width': 8,
          'text-allow-overlap': false,
          'text-padding': 4,
        },
        paint: {
          'text-color': '#2B2B23',
          'text-opacity': [
            'interpolate', ['linear'], ['zoom'],
            3, 0.6,
            6, 0.8,
          ],
          'text-halo-color': '#f5f0eb',
          'text-halo-width': 1.5,
        },
      },
      {
        id: 'label-city',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        filter: [
          'all',
          ['==', 'class', 'city'],
          ['>', 'rank', 4],
        ],
        minzoom: 5,
        layout: {
          'text-field': ['get', 'name:latin'],
          'text-font': ['Open Sans Regular'],
          'text-size': [
            'interpolate', ['linear'], ['zoom'],
            5, 9,
            8, 11,
            12, 14,
          ],
          'text-max-width': 8,
          'text-allow-overlap': false,
          'text-padding': 4,
        },
        paint: {
          'text-color': '#2B2B23',
          'text-opacity': [
            'interpolate', ['linear'], ['zoom'],
            5, 0.5,
            8, 0.7,
          ],
          'text-halo-color': '#f5f0eb',
          'text-halo-width': 1.5,
        },
      },

      // Town labels — zoom 8+
      {
        id: 'label-town',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        filter: ['==', 'class', 'town'],
        minzoom: 8,
        layout: {
          'text-field': ['get', 'name:latin'],
          'text-font': ['Open Sans Regular'],
          'text-size': [
            'interpolate', ['linear'], ['zoom'],
            8, 9,
            12, 12,
          ],
          'text-max-width': 8,
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#6b6560',
          'text-opacity': 0.6,
          'text-halo-color': '#f5f0eb',
          'text-halo-width': 1,
        },
      },

      // Village labels — zoom 10+
      {
        id: 'label-village',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        filter: ['in', 'class', 'village', 'hamlet'],
        minzoom: 11,
        layout: {
          'text-field': ['get', 'name:latin'],
          'text-font': ['Open Sans Regular'],
          'text-size': 10,
          'text-max-width': 8,
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#8a847d',
          'text-opacity': 0.5,
          'text-halo-color': '#f5f0eb',
          'text-halo-width': 1,
        },
      },

      // Water name labels
      {
        id: 'label-water',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'water_name',
        minzoom: 3,
        layout: {
          'text-field': ['get', 'name:latin'],
          'text-font': ['Open Sans Italic'],
          'text-size': [
            'interpolate', ['linear'], ['zoom'],
            3, 10,
            6, 13,
          ],
          'text-letter-spacing': 0.2,
          'text-max-width': 8,
        },
        paint: {
          'text-color': '#8ba4b0',
          'text-opacity': 0.5,
          'text-halo-color': '#d4dde2',
          'text-halo-width': 1,
        },
      },

      // Road name labels — zoom 12+
      {
        id: 'label-road',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'transportation_name',
        minzoom: 12,
        layout: {
          'text-field': ['get', 'name:latin'],
          'text-font': ['Open Sans Regular'],
          'text-size': [
            'interpolate', ['linear'], ['zoom'],
            12, 9,
            16, 12,
          ],
          'symbol-placement': 'line',
          'text-rotation-alignment': 'map',
        },
        paint: {
          'text-color': '#8a847d',
          'text-opacity': 0.6,
          'text-halo-color': '#f5f0eb',
          'text-halo-width': 1,
        },
      },
    ],
  };
}
