'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

type SearchResult = {
  id: string;
  username: string;
  name: string | null;
  image: string | null;
  isFollowing: boolean;
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery)}`
        );
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    searchUsers();
  }, [debouncedQuery]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Search users..."
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : results.length > 0 ? (
          results.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.username}`}
              className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition"
            >
              <div className="relative h-12 w-12 rounded-full overflow-hidden">
                <Image
                  src={user.image || '/default-avatar.png'}
                  alt={user.username}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="ml-4">
                <div className="font-semibold">{user.username}</div>
                {user.name && (
                  <div className="text-sm text-gray-500">{user.name}</div>
                )}
              </div>
              {user.isFollowing && (
                <span className="ml-auto text-sm text-gray-500">Following</span>
              )}
            </Link>
          ))
        ) : query ? (
          <div className="text-center text-gray-500">No users found</div>
        ) : null}
      </div>
    </div>
  );
}
