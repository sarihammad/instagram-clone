'use client';

import { useSession } from 'next-auth/react';
import LocationMap from '@/components/LocationMap';

export default function LocationsPage() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-white">
      <LocationMap />
    </div>
  );
}
