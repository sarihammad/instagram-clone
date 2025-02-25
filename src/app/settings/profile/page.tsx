'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function ProfileSettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    username: '',
    bio: '',
    website: '',
    isPrivate: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      const formDataToSend = new FormData();
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Update session with new data
      await updateSession();
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-6">
          <div className="relative h-24 w-24">
            {imageFile ? (
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src={URL.createObjectURL(imageFile)}
                  alt="Profile preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageFile(null)}
                  className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Image
                src={session?.user?.image || '/default-avatar.png'}
                alt="Profile picture"
                fill
                className="rounded-full object-cover"
              />
            )}
          </div>
          <label className="flex items-center space-x-2 text-blue-500 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Change profile photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Private Account */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="private"
            checked={formData.isPrivate}
            onChange={(e) =>
              setFormData({ ...formData, isPrivate: e.target.checked })
            }
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="private" className="ml-2 block text-sm text-gray-900">
            Private Account
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
