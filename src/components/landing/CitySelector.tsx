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
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      setResults(searchCities(query));
      setIsOpen(true);
      setHighlightIndex(-1);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectCity(city: City) {
    onChange(city);
    setQuery('');
    setIsOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      selectCity(results[highlightIndex]);
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
    <div className="relative">
      {/* Quick picks */}
      <div className="flex flex-wrap gap-1.5 mb-2">
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
      </div>

      {/* Search input */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => query.length > 0 && setIsOpen(true)}
        placeholder="Search any city..."
        className="w-full rounded-lg border border-[#2B2B23]/15 bg-white/60 px-3 py-2 text-sm placeholder:text-[#2B2B23]/30 focus:border-[#2B2B23]/30 focus:outline-none transition-colors"
      />

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="city-dropdown absolute z-50 mt-1 w-full rounded-lg border border-[#2B2B23]/10 bg-white shadow-lg"
        >
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
  );
}
