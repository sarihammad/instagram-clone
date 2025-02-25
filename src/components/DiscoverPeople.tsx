'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { X } from 'lucide-react';

type User = {
  id: string;
  username: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
  mutualFollowersCount: number;
  mutualFollowers: {
    username: string;
    image: string | null;
  }[];
};

export default function DiscoverPeople() {
  const { data: session } = useSession();
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedUsers, setDismissedUsers] = useState<string[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch('/api/users/discover');
        const data = await response.json();
        setSuggestions(data.users);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const handleFollow = async (userId: string) => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to follow user');

      setSuggestions((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, isFollowing: true } : user
        )
      );
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleDismiss = (userId: string) => {
    setDismissedUsers((prev) => [...prev, userId]);
  };

  const visibleSuggestions = suggestions.filter(
    (user) => !dismissedUsers.includes(user.id)
  );

  if (!session?.user || loading || visibleSuggestions.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Suggested for you</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {visibleSuggestions.map((user) => (
          <div
            key={user.id}
            className="border rounded-xl p-4 relative hover:bg-gray-50 transition-colors"
          >
            <button
              onClick={() => handleDismiss(user.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center">
              <Link
                href={`/profile/${user.username}`}
                className="group relative"
              >
                <div className="relative h-20 w-20 rounded-full overflow-hidden mb-3">
                  <Image
                    src={user.image || '/default-avatar.png'}
                    alt={user.username}
                    fill
                    className="object-cover group-hover:opacity-90 transition-opacity"
                  />
                </div>
                <h2 className="font-semibold group-hover:underline">
                  {user.username}
                </h2>
              </Link>
              {user.name && (
                <p className="text-gray-500 text-sm mb-2">{user.name}</p>
              )}
              {user.mutualFollowersCount > 0 && (
                <div className="flex items-center mb-3">
                  <div className="flex -space-x-2 mr-2">
                    {user.mutualFollowers.slice(0, 3).map((follower) => (
                      <div
                        key={follower.username}
                        className="relative w-5 h-5 rounded-full border-2 border-white overflow-hidden"
                      >
                        <Image
                          src={follower.image || '/default-avatar.png'}
                          alt={follower.username}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Followed by {user.mutualFollowers[0].username}
                    {user.mutualFollowersCount > 1 &&
                      ` and ${user.mutualFollowersCount - 1} others`}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500 mb-4">
                <span>{user.postsCount} posts</span>
                <span>•</span>
                <span>{user.followersCount} followers</span>
                <span>•</span>
                <span>{user.followingCount} following</span>
              </div>
              {user.bio && (
                <p className="text-sm mb-4 line-clamp-2">{user.bio}</p>
              )}
              <button
                onClick={() => handleFollow(user.id)}
                className={`w-full py-2 rounded-lg font-semibold text-sm ${
                  user.isFollowing
                    ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {user.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
