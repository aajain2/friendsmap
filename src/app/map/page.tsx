'use client';

import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-[#f5f0eb]">
      <p className="text-sm text-[#2B2B23]/50 tracking-wide">Loading map...</p>
    </div>
  ),
});

export default function MapPage() {
  return <MapView />;
}
