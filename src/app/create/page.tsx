'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, MapPin } from 'lucide-react';
import Image from 'next/image';

export default function CreatePage() {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) return;

    try {
      setUploading(true);

      // Create FormData with the images and details
      const formData = new FormData();
      imageFiles.forEach((file, index) => {
        formData.append(`images`, file);
      });
      formData.append('caption', caption);
      formData.append('location', location);

      // Upload to your API endpoint
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12">
          {imageFiles.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 w-full">
              {imageFiles.map((file, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {imageFiles.length < 10 && (
                <label className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed rounded-lg aspect-square">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500">Add more</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center space-y-2">
              <Upload className="h-12 w-12 text-gray-400" />
              <span className="text-sm text-gray-500">Upload images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700"
            >
              Location
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Add location"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="caption"
              className="block text-sm font-medium text-gray-700"
            >
              Caption
            </label>
            <textarea
              id="caption"
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Write a caption..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={imageFiles.length === 0 || uploading}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {uploading ? 'Creating post...' : 'Create post'}
        </button>
      </form>
    </div>
  );
}
