'use client';

import { useSession } from 'next-auth/react';
import Reels from '@/components/Reels';

export default function ReelsPage() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-black">
      <Reels />
    </div>
  );
}
