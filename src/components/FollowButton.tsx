'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FollowButton({
  userId,
  isFollowing,
}: {
  userId: string;
  isFollowing: boolean;
}) {
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFollow = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          follow: !following,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to follow/unfollow');
      }

      setFollowing(!following);
      router.refresh();
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`rounded px-4 py-1.5 text-sm font-semibold ${
        following
          ? 'border border-gray-300 hover:bg-gray-100'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      } disabled:opacity-50`}
    >
      {loading ? 'Loading...' : following ? 'Following' : 'Follow'}
    </button>
  );
}
