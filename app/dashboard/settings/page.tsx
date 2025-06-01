'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

const backgroundColors = [
  { name: 'Default', value: 'from-indigo-900 via-purple-900 to-pink-800' },
  { name: 'Sunset', value: 'from-orange-500 via-red-600 to-purple-700' },
  { name: 'Ocean', value: 'from-blue-600 via-cyan-700 to-teal-800' },
  { name: 'Forest', value: 'from-green-600 via-emerald-700 to-teal-800' },
  { name: 'Midnight', value: 'from-blue-900 via-indigo-900 to-violet-900' },
  { name: 'Cherry', value: 'from-pink-600 via-red-700 to-rose-800' },
  { name: 'Autumn', value: 'from-amber-500 via-orange-600 to-red-700' },
  { name: 'Dawn', value: 'from-rose-400 via-pink-500 to-purple-600' },
];

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    image: '',
    theme: 'default',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup function to revoke object URL when component unmounts
    // or when previewImage changes
    return () => {
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  useEffect(() => {
    // Fetch current user settings
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/user/settings');
        if (!response.ok) {
          throw new Error('Failed to load settings');
        }
        const data = await response.json();
        setSettings({
          image: data.image || '',
          theme: data.theme || 'default',
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      }
    };

    fetchSettings();
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setLoading(true);
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Upload failed:', responseData);
        throw new Error(responseData.error || 'Failed to upload image');
      }

      // Update settings with the actual uploaded image URL
      setSettings(prev => ({ ...prev, image: responseData.url }));
      // Clear the preview since we now have the actual URL
      setPreviewImage(null);
      
      toast.success('Profile photo updated');
      update(); // Update the session to reflect changes
    } catch (error: any) {
      console.error('Error updating profile photo:', error);
      toast.error(error.message || 'Failed to update profile photo');
      // Clear preview on error
      setPreviewImage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (theme: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme }),
      });

      if (!response.ok) {
        throw new Error('Failed to update theme');
      }

      setSettings(prev => ({ ...prev, theme }));
      toast.success('Background color updated');
    } catch (error) {
      console.error('Error updating theme:', error);
      toast.error('Failed to update background color');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10">
      <header>
        <h1 className="text-2xl font-semibold leading-6 text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-700">
          Customize your profile appearance
        </p>
      </header>

      <div className="mt-8 max-w-2xl">
        {/* Profile Photo Section */}
        <div className="py-6">
          <h2 className="text-lg font-medium text-gray-900">Profile Photo</h2>
          <div className="mt-4 flex items-center space-x-6">
            <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-100">
              {(previewImage || settings.image) ? (
                <img
                  src={previewImage || settings.image}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200">
                  <span className="text-2xl font-medium text-gray-500">
                    {session?.user?.name?.[0] || session?.user?.username?.[0]}
                  </span>
                </div>
              )}
            </div>
            <label className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
              <span>{loading ? 'Uploading...' : 'Change photo'}</span>
              <input
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
              />
            </label>
          </div>
        </div>

        {/* Background Color Section */}
        <div className="border-t border-gray-200 py-6">
          <h2 className="text-lg font-medium text-gray-900">Background Color</h2>
          <p className="mt-1 text-sm text-gray-500">
            Choose a background color for your public profile page
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {backgroundColors.map((color) => (
              <button
                key={color.value}
                onClick={() => handleThemeChange(color.value)}
                className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-4 ${
                  settings.theme === color.value
                    ? 'border-indigo-600 ring-2 ring-indigo-600 ring-offset-2'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
                disabled={loading}
              >
                <div className={`h-20 w-full rounded-md bg-gradient-to-br ${color.value} shadow-sm`} />
                <span className="mt-2 text-sm font-medium text-gray-900">
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 