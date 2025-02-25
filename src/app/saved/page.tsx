'use client';

import { useSession } from 'next-auth/react';
import SavedCollections from '@/components/SavedCollections';

export default function SavedPage() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-white">
      <SavedCollections />
    </div>
  );
}
