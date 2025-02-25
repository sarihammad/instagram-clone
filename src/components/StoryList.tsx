'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Plus } from 'lucide-react';

type Story = {
  id: string;
  user: {
    id: string;
    username: string;
    image: string | null;
  };
  image: string;
  createdAt: Date;
  seen: boolean;
};

type StoryModalProps = {
  story: Story;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
};

function StoryModal({
  story,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}: StoryModalProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasNext) {
        onNext();
      } else {
        onClose();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [story, hasNext, onNext, onClose]);

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full aspect-[9/16]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/30">
          <div className="h-full bg-white animate-story-progress" />
        </div>

        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex items-center">
          <div className="flex items-center">
            <div className="relative h-8 w-8 rounded-full overflow-hidden">
              <Image
                src={story.user.image || '/default-avatar.png'}
                alt={story.user.username}
                fill
                className="object-cover"
              />
            </div>
            <span className="ml-2 text-white font-semibold">
              {story.user.username}
            </span>
          </div>
        </div>

        {/* Story image */}
        <Image src={story.image} alt="" fill className="object-cover" />

        {/* Navigation */}
        <div className="absolute inset-0 flex items-center justify-between">
          {hasPrevious && (
            <button
              onClick={onPrevious}
              className="p-4 hover:bg-black/10"
              aria-label="Previous story"
            >
              ←
            </button>
          )}
          {hasNext && (
            <button
              onClick={onNext}
              className="p-4 hover:bg-black/10"
              aria-label="Next story"
            >
              →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StoryList() {
  const { data: session } = useSession();
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

  useEffect(() => {
    // Fetch stories
    const fetchStories = async () => {
      try {
        const response = await fetch('/api/stories');
        const data = await response.json();
        setStories(data.stories);
      } catch (error) {
        console.error('Error fetching stories:', error);
      }
    };

    fetchStories();
  }, []);

  const handleStoryClick = (story: Story, index: number) => {
    setSelectedStory(story);
    setSelectedStoryIndex(index);
  };

  const handleNext = () => {
    if (selectedStoryIndex < stories.length - 1) {
      setSelectedStory(stories[selectedStoryIndex + 1]);
      setSelectedStoryIndex(selectedStoryIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (selectedStoryIndex > 0) {
      setSelectedStory(stories[selectedStoryIndex - 1]);
      setSelectedStoryIndex(selectedStoryIndex - 1);
    }
  };

  if (!session?.user) return null;

  return (
    <>
      <div className="border rounded-lg bg-white p-4 mb-4">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {/* Add story button */}
          <button className="flex flex-col items-center gap-1">
            <div className="relative h-14 w-14 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors">
              <Plus className="w-6 h-6 text-gray-600" />
            </div>
            <span className="text-xs">Add story</span>
          </button>

          {/* Story list */}
          {stories.map((story, index) => (
            <button
              key={story.id}
              onClick={() => handleStoryClick(story, index)}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={`relative h-14 w-14 rounded-full p-[2px] ${
                  story.seen
                    ? 'bg-gray-300'
                    : 'bg-gradient-to-tr from-yellow-400 to-fuchsia-600'
                }`}
              >
                <div className="relative h-full w-full rounded-full overflow-hidden border-2 border-white">
                  <Image
                    src={story.user.image || '/default-avatar.png'}
                    alt={story.user.username}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <span className="text-xs truncate w-14 text-center">
                {story.user.username}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Story modal */}
      {selectedStory && (
        <StoryModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
          onNext={handleNext}
          onPrevious={handlePrevious}
          hasNext={selectedStoryIndex < stories.length - 1}
          hasPrevious={selectedStoryIndex > 0}
        />
      )}
    </>
  );
}
