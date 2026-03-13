'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TimePeriodSection from './TimePeriodSection';
import { insertUser } from '@/lib/supabase';
import { getRandomColor } from '@/lib/colors';
import type { City } from '@/types';

interface PeriodState {
  city: City | null;
  activity: string;
}

export default function LandingForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [summer, setSummer] = useState<PeriodState>({ city: null, activity: '' });
  const [year1, setYear1] = useState<PeriodState>({ city: null, activity: '' });
  const [year2, setYear2] = useState<PeriodState>({ city: null, activity: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!summer.city || !year1.city || !year2.city) {
      setError('Please select a city for each time period.');
      return;
    }

    setSubmitting(true);
    try {
      await insertUser({
        name: name.trim(),
        node_color: getRandomColor(),
        summer_city: summer.city.name,
        summer_lat: summer.city.lat,
        summer_lng: summer.city.lng,
        summer_activity: summer.activity || null,
        year1_city: year1.city.name,
        year1_lat: year1.city.lat,
        year1_lng: year1.city.lng,
        year1_activity: year1.activity || null,
        year2_city: year2.city.name,
        year2_lat: year2.city.lat,
        year2_lng: year2.city.lng,
        year2_activity: year2.activity || null,
      });
      router.push('/map');
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-xs font-medium tracking-widest uppercase text-[#2B2B23]/50 mb-2">
          Your Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="First and last name"
          className="w-full rounded-lg border border-[#2B2B23]/15 bg-white/60 px-3 py-2.5 text-base placeholder:text-[#2B2B23]/30 focus:border-[#2B2B23]/30 focus:outline-none transition-colors"
        />
      </div>

      {/* Time Periods */}
      <TimePeriodSection
        label="This Summer"
        subtitle="Summer 2026"
        city={summer.city}
        activity={summer.activity}
        onCityChange={(city) => setSummer((s) => ({ ...s, city }))}
        onActivityChange={(activity) => setSummer((s) => ({ ...s, activity }))}
      />

      <TimePeriodSection
        label="1 Year Post Undergrad"
        subtitle="Fall 2026 – Fall 2027"
        city={year1.city}
        activity={year1.activity}
        onCityChange={(city) => setYear1((s) => ({ ...s, city }))}
        onActivityChange={(activity) => setYear1((s) => ({ ...s, activity }))}
      />

      <TimePeriodSection
        label="2 Years Post Undergrad"
        subtitle="Fall 2027 – Fall 2028"
        city={year2.city}
        activity={year2.activity}
        onCityChange={(city) => setYear2((s) => ({ ...s, city }))}
        onActivityChange={(activity) => setYear2((s) => ({ ...s, activity }))}
      />

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-[#2B2B23] py-3 text-sm font-medium text-[#f5f0eb] tracking-wide hover:bg-[#2B2B23]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting...' : 'Enter the Map'}
      </button>
    </form>
  );
}
