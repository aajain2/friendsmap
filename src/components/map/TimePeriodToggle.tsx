'use client';

import type { TimePeriod } from '@/types';

const PERIODS: { key: TimePeriod; label: string }[] = [
  { key: 'summer', label: 'Summer 2026' },
  { key: 'year1', label: '2026-2027' },
  { key: 'year2', label: '2027-2028' },
];

interface TimePeriodToggleProps {
  active: TimePeriod;
  onChange: (period: TimePeriod) => void;
}

export default function TimePeriodToggle({ active, onChange }: TimePeriodToggleProps) {
  return (
    <div className="inline-flex rounded-full bg-white/80 backdrop-blur-md border border-[#2B2B23]/8 p-1 shadow-sm hover-lift">
      {PERIODS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`relative rounded-full px-4 py-1.5 text-xs font-medium tracking-wide transition-all duration-300 spring press-scale ${
            active === key
              ? 'bg-[#2B2B23] text-[#f0e8de] shadow-md'
              : 'text-[#2B2B23]/45 hover:text-[#2B2B23]/75'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
