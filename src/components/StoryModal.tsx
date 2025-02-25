'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Story = {
  id: string;
  imageUrl: string;
  createdAt: Date;
  expiresAt: Date;
};

type User = {
  id: string;
  username: string;
  image: string | null;
  stories: Story[];
};

export default function StoryModal({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < user.stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return 0;
          } else {
            onClose();
            return prev;
          }
        }
        return prev + 1;
      });
    }, 30); // 3 seconds total duration (30ms * 100)

    return () => clearInterval(interval);
  }, [currentIndex, user.stories.length, onClose]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < user.stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="relative w-full max-w-lg aspect-[9/16]">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-600">
          <div
            className="h-full bg-white transition-all duration-30"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* User info */}
        <div className="absolute top-4 left-4 flex items-center text-white">
          <div className="w-8 h-8 relative rounded-full overflow-hidden">
            <Image
              src={user.image || '/default-avatar.png'}
              alt={user.username}
              fill
              className="object-cover"
            />
          </div>
          <span className="ml-2 font-semibold">{user.username}</span>
          <span className="ml-2 text-sm text-gray-300">
            {formatDistanceToNow(user.stories[currentIndex].createdAt)} ago
          </span>
        </div>

        {/* Story image */}
        <div className="w-full h-full relative">
          <Image
            src={user.stories[currentIndex].imageUrl}
            alt="Story"
            fill
            className="object-contain"
          />
        </div>

        {/* Navigation buttons */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}
        {currentIndex < user.stories.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>
  );
}
