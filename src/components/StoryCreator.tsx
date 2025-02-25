'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, Upload } from 'lucide-react';

export default function StoryCreator({ onClose }: { onClose: () => void }) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch('/api/stories/create', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create story');
      }

      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error creating story:', error);
    } finally {
      setUploading(false);
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

      <div className="w-full max-w-lg p-4">
        <h2 className="text-white text-xl font-semibold mb-4">Create Story</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden">
            {imageFile ? (
              <div className="relative w-full h-full">
                <Image
                  src={URL.createObjectURL(imageFile)}
                  alt="Story preview"
                  fill
                  className="object-contain"
                />
                <button
                  type="button"
                  onClick={() => setImageFile(null)}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-75"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400" />
                <span className="text-gray-400 mt-2">Upload a photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={!imageFile || uploading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            {uploading ? 'Creating story...' : 'Share story'}
          </button>
        </form>
      </div>
    </div>
  );
}
