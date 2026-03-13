'use client';

const ACTIVITIES = [
  '',
  'Internship',
  'Full Time',
  'Coterm',
  'Gap Year',
  'Grad School',
  'Undergrad',
  'Other',
];

interface ActivityDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ActivityDropdown({ value, onChange }: ActivityDropdownProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-[#2B2B23]/15 bg-white/60 px-3 py-2 text-sm text-[#2B2B23] focus:border-[#2B2B23]/30 focus:outline-none transition-colors appearance-none cursor-pointer"
    >
      <option value="">Activity (optional)</option>
      {ACTIVITIES.filter(Boolean).map((a) => (
        <option key={a} value={a}>
          {a}
        </option>
      ))}
    </select>
  );
}
