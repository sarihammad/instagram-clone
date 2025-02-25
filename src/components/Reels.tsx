'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useInView } from 'react-intersection-observer';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share,
  Music,
  Volume2,
  VolumeX,
  Play,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

type Reel = {
  id: string;
  videoUrl: string;
  caption: string;
  audioTitle: string;
  user: User;
  likes: { id: string; userId: string }[];
  comments: Comment[];
  _count: {
    likes: number;
    comments: number;
  };
  createdAt: Date;
};

function ReelCard({
  reel,
  onVideoInView,
}: {
  reel: Reel;
  onVideoInView: (id: string) => void;
}) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(
    reel.likes.some((like) => like.userId === session?.user?.id)
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref, inView } = useInView({
    threshold: 0.7,
  });

  useEffect(() => {
    if (inView) {
      onVideoInView(reel.id);
      videoRef.current?.play();
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [inView, reel.id, onVideoInView]);

  const handleLike = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/reels/${reel.id}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
      });

      if (!response.ok) throw new Error('Failed to like/unlike reel');

      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error liking/unliking reel:', error);
    }
  };

  const handleSave = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/reels/${reel.id}/save`, {
        method: isSaved ? 'DELETE' : 'POST',
      });

      if (!response.ok) throw new Error('Failed to save/unsave reel');

      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error saving/unsaving reel:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !comment.trim()) return;

    try {
      const response = await fetch(`/api/reels/${reel.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment }),
      });

      if (!response.ok) throw new Error('Failed to add comment');

      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current?.pause();
    } else {
      videoRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      ref={ref}
      className="snap-start w-full h-[calc(100vh-65px)] flex items-center justify-center bg-black"
    >
      <div className="relative w-full max-w-[400px] aspect-[9/16]">
        {/* Video */}
        <video
          ref={videoRef}
          src={reel.videoUrl}
          className="w-full h-full object-cover"
          loop
          muted={isMuted}
          playsInline
          onClick={togglePlay}
        />

        {/* Play/Pause overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Play className="w-16 h-16 text-white" />
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
          {/* User info and caption */}
          <div className="flex items-center mb-4">
            <Link
              href={`/profile/${reel.user.username}`}
              className="flex items-center"
            >
              <div className="relative h-8 w-8 rounded-full overflow-hidden">
                <Image
                  src={reel.user.image || '/default-avatar.png'}
                  alt={reel.user.username}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="ml-2 font-semibold text-white">
                {reel.user.username}
              </span>
            </Link>
          </div>

          {/* Caption */}
          <p className="text-white text-sm mb-2">{reel.caption}</p>

          {/* Audio */}
          <div className="flex items-center text-white text-sm mb-4">
            <Music className="w-4 h-4 mr-2" />
            <span className="truncate">{reel.audioTitle}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`text-white ${isLiked ? 'text-red-500' : ''}`}
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => setShowComments(true)}
                className="text-white"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
              <button className="text-white">
                <Share className="w-6 h-6" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={toggleMute} className="text-white">
                {isMuted ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </button>
              <button
                onClick={handleSave}
                className={`text-white ${isSaved ? 'text-yellow-500' : ''}`}
              >
                <Bookmark
                  className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Comments modal */}
        {showComments && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-semibold">Comments</h2>
                <button
                  onClick={() => setShowComments(false)}
                  className="text-gray-500"
                >
                  ✕
                </button>
              </div>
              <div className="overflow-y-auto p-4 max-h-[60vh]">
                {reel.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start mb-4">
                    <Link
                      href={`/profile/${comment.user.username}`}
                      className="shrink-0"
                    >
                      <div className="relative h-8 w-8 rounded-full overflow-hidden">
                        <Image
                          src={comment.user.image || '/default-avatar.png'}
                          alt={comment.user.username}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        <Link
                          href={`/profile/${comment.user.username}`}
                          className="font-semibold text-sm hover:underline"
                        >
                          {comment.user.username}
                        </Link>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatDistanceToNow(comment.createdAt, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <form
                onSubmit={handleComment}
                className="p-4 border-t flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-gray-400"
                />
                <button
                  type="submit"
                  disabled={!comment.trim()}
                  className="text-blue-500 font-semibold text-sm disabled:opacity-50"
                >
                  Post
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Reels() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await fetch('/api/reels');
        const data = await response.json();
        setReels(data.reels);
      } catch (error) {
        console.error('Error fetching reels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-65px)]">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-65px)] overflow-y-auto snap-y snap-mandatory">
      {reels.map((reel) => (
        <ReelCard key={reel.id} reel={reel} onVideoInView={() => {}} />
      ))}
    </div>
  );
}
