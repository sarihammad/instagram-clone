'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Heart, MessageCircle, Bookmark, Share, Smile } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

type PostImage = {
  id: string;
  url: string;
  order: number;
};

type User = {
  id: string;
  username: string;
  image: string | null;
};

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  user: User;
};

type Post = {
  id: string;
  caption: string | null;
  location: string | null;
  createdAt: Date;
  images: PostImage[];
  user: User;
  likes: { id: string; userId: string }[];
  comments: Comment[];
  _count: {
    likes: number;
    comments: number;
  };
};

type EmojiData = {
  id: string;
  name: string;
  native: string;
  unified: string;
  keywords: string[];
  shortcodes: string;
};

export default function FeedPost({ post }: { post: Post }) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(
    post.likes.some((like) => like.userId === session?.user?.id)
  );
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [comment, setComment] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [recentComments, setRecentComments] = useState<Comment[]>(
    post.comments.slice(-2)
  );
  const lastTapTime = useRef(0);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const handleLike = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
      });

      if (!response.ok) throw new Error('Failed to like/unlike post');

      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  const handleSave = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/posts/${post.id}/save`, {
        method: isSaved ? 'DELETE' : 'POST',
      });

      if (!response.ok) throw new Error('Failed to save/unsave post');

      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error saving/unsaving post:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !comment.trim()) return;

    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment }),
      });

      if (!response.ok) throw new Error('Failed to add comment');

      const newComment = await response.json();
      setRecentComments((prev) => [...prev.slice(-1), newComment]);
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDoubleTap = async () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapTime.current < DOUBLE_TAP_DELAY) {
      if (!isLiked) {
        setShowLikeAnimation(true);
        await handleLike();
      }
    }

    lastTapTime.current = now;
  };

  useEffect(() => {
    if (showLikeAnimation) {
      const timer = setTimeout(() => {
        setShowLikeAnimation(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showLikeAnimation]);

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev < post.images.length - 1 ? prev + 1 : prev
    );
  };

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  return (
    <div className="bg-white border rounded-lg max-w-xl w-full">
      {/* Header */}
      <div className="flex items-center p-4">
        <Link
          href={`/profile/${post.user.username}`}
          className="flex items-center flex-1"
        >
          <div className="relative h-8 w-8 rounded-full overflow-hidden">
            <Image
              src={post.user.image || '/default-avatar.png'}
              alt={post.user.username}
              fill
              className="object-cover"
            />
          </div>
          <div className="ml-3">
            <span className="font-semibold text-sm">{post.user.username}</span>
            {post.location && (
              <p className="text-xs text-gray-500">{post.location}</p>
            )}
          </div>
        </Link>
        <button className="text-gray-600 hover:text-gray-900">•••</button>
      </div>

      {/* Image */}
      <div
        className="relative aspect-square bg-black"
        onDoubleClick={handleDoubleTap}
        role="button"
        tabIndex={0}
      >
        <Image
          src={post.images[currentImageIndex].url}
          alt={post.caption || ''}
          fill
          className="object-contain"
        />
        {showLikeAnimation && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart className="w-24 h-24 text-white fill-white animate-like-heart" />
          </div>
        )}
        {post.images.length > 1 && (
          <>
            {currentImageIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70"
              >
                ←
              </button>
            )}
            {currentImageIndex < post.images.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70"
              >
                →
              </button>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {post.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-blue-500' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center -ml-2 space-x-4">
            <button
              onClick={handleLike}
              className={`p-2 hover:opacity-60 ${
                isLiked ? 'text-red-500' : 'text-black'
              }`}
            >
              <Heart
                className={`w-6 h-6 ${
                  isLiked ? 'fill-current animate-like' : ''
                }`}
              />
            </button>
            <button
              onClick={() => commentInputRef.current?.focus()}
              className="p-2 hover:opacity-60"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="p-2 hover:opacity-60">
              <Share className="w-6 h-6" />
            </button>
          </div>
          <button
            onClick={handleSave}
            className={`p-2 hover:opacity-60 ${
              isSaved ? 'text-black' : 'text-black'
            }`}
          >
            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Likes */}
        <p className="font-semibold text-sm mb-2">{likeCount} likes</p>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm mb-2">
            <Link
              href={`/profile/${post.user.username}`}
              className="font-semibold mr-2"
            >
              {post.user.username}
            </Link>
            {post.caption}
          </p>
        )}

        {/* Comments */}
        {post._count.comments > 2 && (
          <Link
            href={`/p/${post.id}`}
            className="text-gray-500 text-sm mb-2 block"
          >
            View all {post._count.comments} comments
          </Link>
        )}
        {recentComments.map((comment) => (
          <div key={comment.id} className="text-sm mb-2">
            <Link
              href={`/profile/${comment.user.username}`}
              className="font-semibold mr-2"
            >
              {comment.user.username}
            </Link>
            {comment.content}
          </div>
        ))}

        {/* Timestamp */}
        <p className="text-gray-500 text-[10px] uppercase tracking-wide mt-2">
          {formatDistanceToNow(post.createdAt)} ago
        </p>

        {/* Comment input */}
        <form
          onSubmit={handleComment}
          className="mt-3 flex items-center pt-3 border-t"
        >
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className="mr-2"
          >
            <Smile className="w-6 h-6 text-gray-600" />
          </button>
          <input
            ref={commentInputRef}
            type="text"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1 outline-none text-sm"
          />
          <button
            type="submit"
            disabled={!comment.trim()}
            className={`ml-2 text-blue-500 font-semibold text-sm ${
              !comment.trim() ? 'opacity-40' : 'hover:text-blue-600'
            }`}
          >
            Post
          </button>
        </form>

        {/* Emoji picker */}
        {showEmoji && (
          <div className="absolute mt-2">
            <Picker
              data={data}
              onEmojiSelect={(emoji: EmojiData) => {
                setComment((prev) => prev + emoji.native);
                setShowEmoji(false);
              }}
              theme="light"
              previewPosition="none"
              skinTonePosition="none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
