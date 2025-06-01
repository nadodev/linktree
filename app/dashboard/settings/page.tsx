'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { HexColorPicker } from 'react-colorful';
import { IoMdEye } from 'react-icons/io';
import Link from 'next/link';

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

function hexToRgba(hex: string, opacity: number): string {
  const rgbaMatch = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbaMatch) {
    const [_, r, g, b] = rgbaMatch;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  hex = hex.replace('#', '');
  
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    console.warn('Invalid color format:', hex);
    return `rgba(0, 0, 0, ${opacity})`;
  }
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

type Settings = {
  image: string;
  theme: string;
  bio: string;
  backgroundColor: string | null;
  backgroundImage: string | null;
};

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorOpacity, setColorOpacity] = useState(0.5);
  const [settings, setSettings] = useState<Settings>({
    image: '',
    theme: 'default',
    bio: '',
    backgroundColor: null,
    backgroundImage: null,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewBackgroundImage, setPreviewBackgroundImage] = useState<string | null>(null);
  const [backgroundType, setBackgroundType] = useState<'image' | 'color' | 'gradient'>('gradient');
  const [tempSettings, setTempSettings] = useState<Partial<Settings>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
      if (previewBackgroundImage && previewBackgroundImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewBackgroundImage);
      }
    };
  }, [previewImage, previewBackgroundImage]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/user/settings');
        if (!response.ok) {
          throw new Error('Failed to load settings');
        }
        const data = await response.json();
        console.log('Fetched settings:', data);
        setSettings({
          image: data.image || '',
          theme: data.theme || 'default',
          bio: data.bio || '',
          backgroundColor: data.backgroundColor || null,
          backgroundImage: data.backgroundImage || null,
        });

        if (data.backgroundImage) {
          setBackgroundType('image');
        } else if (data.backgroundColor) {
          setBackgroundType('color');
        } else {
          setBackgroundType('gradient');
        }

        if (data.backgroundColor) {
          const opacityMatch = data.backgroundColor.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
          if (opacityMatch) {
            setColorOpacity(parseFloat(opacityMatch[1]));
          }
        }
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

      setSettings(prev => ({ ...prev, image: responseData.url }));
      setPreviewImage(null);
      
      toast.success('Profile photo updated');
      update();
    } catch (error: any) {
      console.error('Error updating profile photo:', error);
      toast.error(error.message || 'Failed to update profile photo');
      setPreviewImage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBackgroundImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      const previewUrl = URL.createObjectURL(file);
      setPreviewBackgroundImage(previewUrl);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'background');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to upload background image');
      }

      setSettings(prev => ({ ...prev, backgroundImage: responseData.url }));
      setPreviewBackgroundImage(null);
      
      toast.success('Background image updated');
      update();
    } catch (error: any) {
      console.error('Error updating background image:', error);
      toast.error(error.message || 'Failed to update background image');
      setPreviewBackgroundImage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (updates: Partial<Settings>) => {
    try {
      setLoading(true);
      console.log('Updating settings with:', updates);
      
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errorMessage = data.errors.map((e: any) => `${e.path}: ${e.message}`).join(', ');
          throw new Error(errorMessage);
        }
        throw new Error(data.message || 'Failed to update settings');
      }

      setSettings(prev => ({ ...prev, ...data }));
      toast.success('Settings updated');
      update();
      return data;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update settings');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBio = e.target.value;
    setSettings(prev => ({ ...prev, bio: newBio }));
  };

  const handleBioBlur = () => {
    if (settings.bio !== undefined) {
      handleSettingsUpdate({ bio: settings.bio });
    }
  };

  const handleBackgroundColorChange = (color: string) => {
    try {
      const rgbaColor = hexToRgba(color, colorOpacity);
      console.log('Setting background color:', rgbaColor);
      
      setTempSettings(prev => ({ ...prev, backgroundColor: rgbaColor }));
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('Error processing color:', error);
      toast.error('Invalid color format');
    }
  };

  const handleOpacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const newOpacity = parseFloat(event.target.value);
      setColorOpacity(newOpacity);
      
      if (settings.backgroundColor || tempSettings.backgroundColor) {
        const currentColor = (tempSettings.backgroundColor || settings.backgroundColor)?.match(/#[0-9a-f]{6}/i)?.[0] || 
                           (tempSettings.backgroundColor || settings.backgroundColor)?.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)?.[0] || 
                           '#000000';
        
        const rgbaColor = hexToRgba(currentColor, newOpacity);
        console.log('Updating color with new opacity:', rgbaColor);
        
        setTempSettings(prev => ({ ...prev, backgroundColor: rgbaColor }));
        setHasUnsavedChanges(true);
      }
    } catch (error) {
      console.error('Error updating opacity:', error);
      toast.error('Failed to update color opacity');
    }
  };

  const handleBackgroundTypeChange = async (type: 'image' | 'color' | 'gradient') => {
    setShowColorPicker(false);
    console.log('Changing background type to:', type);
    
    let updates: Partial<Settings> = {};
    
    if (type === 'gradient') {
      updates = {
        theme: backgroundColors[0].value,
        backgroundImage: null,
        backgroundColor: null
      };
    } else if (type === 'color') {
      updates = {
        backgroundImage: null,
        theme: 'default',
        backgroundColor: 'rgba(0, 0, 0, 1)'
      };
    } else if (type === 'image') {
      updates = {
        theme: 'default',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      };
    }

    setTempSettings(updates);
    setBackgroundType(type);
    setHasUnsavedChanges(true);
  };

  const handleGradientSelect = (gradientValue: string) => {
    const updates: Partial<Settings> = {
      theme: gradientValue,
      backgroundImage: null,
      backgroundColor: null
    };

    setTempSettings(updates);
    setHasUnsavedChanges(true);
  };

  const handleSaveBackgroundChanges = async () => {
    try {
      setLoading(true);
      await handleSettingsUpdate(tempSettings);
      setTempSettings({});
      setHasUnsavedChanges(false);
      toast.success('Background settings saved');
    } catch (error) {
      console.error('Error saving background settings:', error);
      toast.error('Failed to save background settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelChanges = () => {
    setTempSettings({});
    setHasUnsavedChanges(false);
    setBackgroundType(
      settings.backgroundImage ? 'image' : 
      settings.backgroundColor ? 'color' : 
      'gradient'
    );
  };

  // Função para obter o valor atual de uma configuração (temporária ou salva)
  const getCurrentSetting = (key: keyof Settings) => {
    return tempSettings[key] !== undefined ? tempSettings[key] : settings[key];
  };

  return (
    <div className="py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Configurações</h1>
          <p className="mt-2 text-sm text-gray-700">
            Personalize sua página de perfil
          </p>
        </div>
        <Link
          href={`/${session?.user?.username}`}
          target="_blank"
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          <IoMdEye className="h-5 w-5" />
          Visualizar Perfil
        </Link>
      </header>

      <div className="mt-8 max-w-2xl space-y-8">
        {/* Profile Photo Section */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-medium text-gray-900">Foto de Perfil</h2>
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

        {/* Bio Section */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-medium text-gray-900">Bio</h2>
          <p className="mt-1 text-sm text-gray-500">
            Escreva uma descrição curta sobre você
          </p>
          <div className="mt-4">
            <textarea
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 px-4 py-2"
              value={settings.bio}
              onChange={handleBioChange}
              onBlur={handleBioBlur}
              placeholder="Diga algo sobre você..."
              maxLength={500}
            />
          </div>
        </div>

        {/* Background Customization Section */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Personalização de Fundo</h2>
            {hasUnsavedChanges && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelChanges}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveBackgroundChanges}
                  className="px-4 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            )}
          </div>
          
          {/* Background Type Selection */}
          <div className="mt-4 space-y-4">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleBackgroundTypeChange('color')}
                className={`px-4 py-2 rounded-md ${
                  backgroundType === 'color'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                disabled={loading}
              >
                Cor Sólida
              </button>
              <button
                type="button"
                onClick={() => handleBackgroundTypeChange('gradient')}
                className={`px-4 py-2 rounded-md ${
                  backgroundType === 'gradient'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                disabled={loading}
              >
                Gradiente
              </button>
            </div>

            {/* Background Image Section */}
            {backgroundType === 'image' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Background Image
                  </label>
                  <div className="mt-2 flex items-center gap-4">
                    <div 
                      className="h-32 w-48 overflow-hidden rounded-lg border border-gray-300 relative"
                      style={{
                        backgroundImage: (previewBackgroundImage || settings.backgroundImage) 
                          ? `url(${previewBackgroundImage || settings.backgroundImage})`
                          : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {!(previewBackgroundImage || settings.backgroundImage) && (
                        <div className="flex h-full w-full items-center justify-center bg-gray-50">
                          <span className="text-sm text-gray-500">No background image</span>
                        </div>
                      )}
                      {(previewBackgroundImage || settings.backgroundImage) && (
                        <div
                          className="absolute inset-0"
                          style={{ backgroundColor: getCurrentSetting('backgroundColor') || 'rgba(0,0,0,0.5)' }}
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500 border border-indigo-600">
                        <span>{loading ? 'Uploading...' : 'Upload image'}</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleBackgroundImageChange}
                          disabled={loading}
                        />
                      </label>
                      {(settings.backgroundImage || previewBackgroundImage) && (
                        <button
                          type="button"
                          onClick={() => handleSettingsUpdate({ backgroundImage: null })}
                          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:text-red-500 border border-red-600"
                          disabled={loading}
                        >
                          Remove image
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Overlay Color for Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overlay Color & Opacity
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-300"
                      style={{ backgroundColor: getCurrentSetting('backgroundColor') || 'rgba(0,0,0,0.5)' }}
                      disabled={loading}
                    />
                    {showColorPicker && (
                      <div className="absolute z-10">
                        <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
                        <div className="relative">
                          <HexColorPicker
                            color={getCurrentSetting('backgroundColor')?.match(/#[0-9a-f]{6}/i)?.[0] || '#000000'}
                            onChange={handleBackgroundColorChange}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex-1 max-w-xs">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Overlay Opacity: {Math.round(colorOpacity * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={colorOpacity}
                        onChange={handleOpacityChange}
                        className="w-full"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Solid Color Section */}
            {backgroundType === 'color' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor de Fundo
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-300"
                    style={{ backgroundColor: getCurrentSetting('backgroundColor') || '#ffffff' }}
                    disabled={loading}
                  />
                  {showColorPicker && (
                    <div className="absolute z-10">
                      <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
                      <div className="relative">
                        <HexColorPicker
                          color={getCurrentSetting('backgroundColor')?.match(/#[0-9a-f]{6}/i)?.[0] || '#ffffff'}
                          onChange={handleBackgroundColorChange}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Gradient Section */}
            {backgroundType === 'gradient' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tema do Gradiente
                </label>
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {backgroundColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => handleGradientSelect(color.value)}
                      className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-4 ${
                        getCurrentSetting('theme') === color.value
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
            )}
          </div>
        </div>

      </div>
    </div>
  );
} 