'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Grid, MoreHorizontal, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Post = {
  id: string;
  images: { id: string; url: string }[];
  caption: string | null;
  createdAt: Date;
  archivedAt: Date;
  _count: {
    likes: number;
    comments: number;
  };
};

export default function ArchivedPosts() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostOptions, setShowPostOptions] = useState<string | null>(null);

  useEffect(() => {
    const fetchArchivedPosts = async () => {
      try {
        const response = await fetch('/api/posts/archived');
        const data = await response.json();
        setPosts(data.posts);
      } catch (error) {
        console.error('Error fetching archived posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArchivedPosts();
  }, []);

  const handleUnarchive = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/unarchive`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to unarchive post');

      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (error) {
      console.error('Error unarchiving post:', error);
    }
  };

  const handleDelete = async (postId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this post? This cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete post');

      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
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

  if (posts.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No archived posts</h2>
        <p className="text-gray-500">
          When you archive posts, they'll appear here and will only be visible
          to you.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Archive</h1>
        <p className="text-gray-500">Only you can see what you've archived</p>
      </div>

      {/* Posts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {posts.map((post) => (
          <div key={post.id} className="relative">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              {post.images[0] ? (
                <Image
                  src={post.images[0].url}
                  alt={post.caption || ''}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Grid className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                <div className="flex items-center gap-6 text-white">
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6"
                    >
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                    <span className="font-semibold">{post._count.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-semibold">
                      {post._count.comments}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Post info */}
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Archived{' '}
                  {formatDistanceToNow(post.archivedAt, { addSuffix: true })}
                </p>
                <button
                  onClick={() =>
                    setShowPostOptions(
                      showPostOptions === post.id ? null : post.id
                    )
                  }
                  className="text-gray-500 hover:text-gray-900"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Post options dropdown */}
              {showPostOptions === post.id && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-10">
                  <button
                    onClick={() => handleUnarchive(post.id)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Show on profile
                  </button>
                  <Link
                    href={`/p/${post.id}`}
                    className="block px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Go to post
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
