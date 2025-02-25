'use client';

import { useSession } from 'next-auth/react';
import ArchivedPosts from '@/components/ArchivedPosts';

export default function ArchivePage() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-white">
      <ArchivedPosts />
    </div>
  );
}
