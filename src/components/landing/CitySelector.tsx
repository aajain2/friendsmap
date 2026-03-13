'use client';

import { useState, useRef, useEffect } from 'react';
import { QUICK_PICKS, searchCities } from '@/lib/cities';
import type { City } from '@/types';

interface CitySelectorProps {
  value: City | null;
  onChange: (city: City | null) => void;
}

export default function CitySelector({ value, onChange }: CitySelectorProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      setResults(searchCities(query));
      setHighlightIndex(-1);
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  function selectCity(city: City) {
    onChange(city);
    setQuery('');
    setIsSearchOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      selectCity(results[highlightIndex]);
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setQuery('');
    }
  }

  if (value) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2B2B23]/8 px-3 py-1.5 text-sm">
          {value.name}, {value.country}
          <button
            type="button"
            onClick={() => onChange(null)}
            className="ml-1 text-[#2B2B23]/40 hover:text-[#2B2B23] transition-colors"
          >
            ×
          </button>
        </span>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex flex-wrap gap-1.5">
        {QUICK_PICKS.map((city) => (
          <button
            key={city.name}
            type="button"
            onClick={() => selectCity(city)}
            className="rounded-full border border-[#2B2B23]/15 px-2.5 py-1 text-xs text-[#2B2B23]/70 hover:border-[#2B2B23]/30 hover:text-[#2B2B23] transition-colors"
          >
            {city.name}
          </button>
        ))}

        {/* Search pill — expands into input */}
        {isSearchOpen ? (
          <div className="relative flex-1 min-w-[160px]">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search city..."
              className="w-full rounded-full border border-[#2B2B23]/25 bg-white/70 pl-7 pr-3 py-1 text-xs placeholder:text-[#2B2B23]/30 focus:border-[#2B2B23]/35 focus:outline-none transition-colors"
            />
            {/* Search icon inside input */}
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#2B2B23]/30"
              width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            >
              <circle cx="6" cy="6" r="5" />
              <path d="M10 10L13 13" />
            </svg>

            {/* Dropdown */}
            {results.length > 0 && (
              <div className="city-dropdown absolute z-50 mt-1.5 left-0 w-full min-w-[200px] rounded-lg border border-[#2B2B23]/10 bg-white shadow-lg">
                {results.map((city, i) => (
                  <button
                    key={`${city.name}-${city.country}`}
                    type="button"
                    onClick={() => selectCity(city)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-[#2B2B23]/5 transition-colors ${
                      i === highlightIndex ? 'bg-[#2B2B23]/5' : ''
                    }`}
                  >
                    <span className="font-medium">{city.name}</span>
                    <span className="ml-1.5 text-[#2B2B23]/40">{city.country}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="rounded-full border border-[#2B2B23]/15 px-2.5 py-1 text-xs text-[#2B2B23]/40 hover:border-[#2B2B23]/30 hover:text-[#2B2B23]/60 transition-colors flex items-center gap-1"
          >
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="6" cy="6" r="5" />
              <path d="M10 10L13 13" />
            </svg>
            Search
          </button>
        )}
      </div>
    </div>
  );
}
