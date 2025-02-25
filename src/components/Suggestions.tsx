'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

type Suggestion = {
  id: string;
  username: string;
  name: string | null;
  image: string | null;
  mutualFollowers: string[];
};

export default function Suggestions() {
  const { data: session } = useSession();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch('/api/users/suggestions');
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  if (!session?.user) return null;

  return (
    <div>
      {/* User info */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/profile/${session.user.username}`}
          className="flex items-center gap-4"
        >
          <div className="relative w-12 h-12 rounded-full overflow-hidden">
            <Image
              src={session.user.image || '/default-avatar.png'}
              alt={session.user.name || 'Profile'}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="font-semibold">{session.user.username}</div>
            <div className="text-gray-500">{session.user.name}</div>
          </div>
        </Link>
        <button className="text-blue-500 text-sm font-semibold">Switch</button>
      </div>

      {/* Suggestions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-500 font-semibold">
            Suggestions For You
          </span>
          <Link href="/explore/people" className="text-sm font-semibold">
            See All
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-3">
            {suggestions.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <Link
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-3"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={user.image || '/default-avatar.png'}
                      alt={user.username}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{user.username}</div>
                    {user.mutualFollowers.length > 0 ? (
                      <div className="text-gray-500 text-xs">
                        Followed by {user.mutualFollowers[0]}
                        {user.mutualFollowers.length > 1 &&
                          ` + ${user.mutualFollowers.length - 1} more`}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-xs">
                        Suggested for you
                      </div>
                    )}
                  </div>
                </Link>
                <button className="text-blue-500 text-xs font-semibold">
                  Follow
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">No suggestions</div>
        )}
      </div>

      {/* Footer links */}
      <div className="mt-6 text-xs text-gray-400">
        <div className="space-x-1">
          <Link href="/about">About</Link>
          <span>·</span>
          <Link href="/help">Help</Link>
          <span>·</span>
          <Link href="/press">Press</Link>
          <span>·</span>
          <Link href="/api">API</Link>
          <span>·</span>
          <Link href="/jobs">Jobs</Link>
          <span>·</span>
          <Link href="/privacy">Privacy</Link>
          <span>·</span>
          <Link href="/terms">Terms</Link>
        </div>
        <div className="mt-4">© 2024 Instagram Clone</div>
      </div>
    </div>
  );
}
