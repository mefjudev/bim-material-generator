'use client';

import { useState } from 'react';
import Image from 'next/image';
import ImageUpload from '@/components/ImageUpload';
import MaterialSchedule from '../components/MaterialSchedule';
import { BIMItem } from '@/types/bim';
import { Wand2, Loader2 } from 'lucide-react';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [materials, setMaterials] = useState<BIMItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setError(null);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setMaterials([]);
    setError(null);
  };

  const generateMaterials = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch('/api/generate-materials', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`Failed to generate materials: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      setMaterials(data.materials);
    } catch (err) {
      setError('Failed to generate materials. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-full lg:max-w-screen-2xl">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Title and Description */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 mr-4">
                <Image
                  src="/Logo.png"
                  alt="Palette Studio Logo"
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#34544D]">Palette Studio</h1>
                <h2 className="text-4xl font-bold text-gray-900">Material Schedule Generator</h2>
              </div>
            </div>
            <p className="text-lg text-gray-600">
              Upload an image of your space and get a detailed material schedule 
              with supplier information and pricing.
            </p>
          </div>

          {/* Right Column - Upload and Generate */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Upload Image
              </h2>
              <ImageUpload
                onImageSelect={handleImageSelect}
                selectedImage={selectedImage}
                onRemoveImage={handleRemoveImage}
              />
            </div>

            {/* Generate Button */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <button
                onClick={generateMaterials}
                disabled={!selectedImage || isLoading}
                className={`w-full flex items-center justify-center px-6 py-4 rounded-lg font-semibold text-lg transition-colors ${
                  !selectedImage || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#34544D] text-white hover:bg-[#2a433c]'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Generating Materials...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-6 h-6 mr-3" />
                    Generate Materials
                  </>
                )}
              </button>
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Material Schedule - Full Width Below */}
        <div className="w-full">
          <MaterialSchedule materials={materials} isLoading={isLoading} />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500">
          <p>Powered by OpenAI GPT-4 Vision</p>
        </div>
      </div>
    </div>
  );
}
