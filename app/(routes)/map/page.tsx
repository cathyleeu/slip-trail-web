'use client';

import dynamic from 'next/dynamic';

// Import map component with no SSR (client-side only)
const Map = dynamic(() => import('@/app/components/map'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen">Loading map...</div>,
});

export default function MapPage() {
  return (
    <div className="w-full h-screen">
      <Map />
    </div>
  );
}
