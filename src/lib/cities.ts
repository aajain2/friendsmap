import citiesData from '@/data/cities.json';
import type { City } from '@/types';

const cities: City[] = citiesData as City[];

const QUICK_PICK_NAMES = ['Stanford', 'Palo Alto', 'San Francisco', 'New York City', 'Los Angeles'];

export const QUICK_PICKS: City[] = QUICK_PICK_NAMES
  .map((name) => cities.find((c) => c.name === name)!)
  .filter(Boolean);

export function searchCities(query: string): City[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results = cities.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q)
  );
  // Sort: exact prefix matches first, then alphabetical
  results.sort((a, b) => {
    const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
    const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;
    return a.name.localeCompare(b.name);
  });
  return results.slice(0, 10);
}

export { cities };
