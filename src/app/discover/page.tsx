'use client';

import { useSession } from 'next-auth/react';
import DiscoverPeople from '@/components/DiscoverPeople';

export default function DiscoverPage() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-white">
      <DiscoverPeople />
    </div>
  );
}
