'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Plus, Grid, Lock, MoreHorizontal } from 'lucide-react';

type Post = {
  id: string;
  images: { id: string; url: string }[];
};

type Collection = {
  id: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  coverImage: string | null;
  _count: {
    posts: number;
  };
  posts: Post[];
};

export default function SavedCollections() {
  const { data: session } = useSession();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('/api/collections');
        const data = await response.json();
        setCollections(data.collections);
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !newCollectionName.trim()) return;

    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCollectionName,
          description: newCollectionDescription,
          isPrivate,
        }),
      });

      if (!response.ok) throw new Error('Failed to create collection');

      const newCollection = await response.json();
      setCollections((prev) => [...prev, newCollection]);
      setShowCreateModal(false);
      setNewCollectionName('');
      setNewCollectionDescription('');
      setIsPrivate(false);
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  if (!session?.user) return null;

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Saved</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">New collection</span>
        </button>
      </div>

      {/* Collections grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.id}`}
            className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
          >
            {collection.coverImage ? (
              <Image
                src={collection.coverImage}
                alt={collection.name}
                fill
                className="object-cover"
              />
            ) : collection.posts[0]?.images[0]?.url ? (
              <Image
                src={collection.posts[0].images[0].url}
                alt={collection.name}
                fill
                className="object-cover"
              />
            ) : (
              <Grid className="w-12 h-12 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-semibold mb-1">
                    {collection.name}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {collection._count.posts} posts
                  </p>
                </div>
                {collection.isPrivate && (
                  <Lock className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                // Handle collection options
              }}
              className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </Link>
        ))}
      </div>

      {/* Create collection modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-center">
                New collection
              </h2>
            </div>
            <form onSubmit={handleCreateCollection} className="p-4 space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400"
                  maxLength={50}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400 resize-none"
                  rows={3}
                  maxLength={500}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="private"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="private" className="ml-2 text-sm text-gray-700">
                  Make collection private
                </label>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newCollectionName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
