'use client';

import CitySelector from './CitySelector';
import ActivityDropdown from './ActivityDropdown';
import type { City } from '@/types';

interface TimePeriodSectionProps {
  label: string;
  subtitle: string;
  city: City | null;
  activity: string;
  onCityChange: (city: City | null) => void;
  onActivityChange: (activity: string) => void;
}

export default function TimePeriodSection({
  label,
  subtitle,
  city,
  activity,
  onCityChange,
  onActivityChange,
}: TimePeriodSectionProps) {
  return (
    <div className="border-t border-[#2B2B23]/10 pt-5">
      <div className="mb-3">
        <h3 className="text-xs font-medium tracking-widest uppercase text-[#2B2B23]/50">
          {label}
        </h3>
        <p className="text-xs text-[#2B2B23]/30 mt-0.5">{subtitle}</p>
      </div>
      <div className="space-y-2">
        <CitySelector value={city} onChange={onCityChange} />
        <ActivityDropdown value={activity} onChange={onActivityChange} />
      </div>
    </div>
  );
}
