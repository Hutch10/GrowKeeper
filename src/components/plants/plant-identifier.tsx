'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';

interface IdentificationResult {
  commonName: string;
  scientificName: string;
  confidence: number;
  careGuide: {
    water: string;
    light: string;
    humidity: string;
    temperature: string;
    soil: string;
    fertilizer: string;
  };
  description: string;
  toxicity: string;
  difficulty: 'easy' | 'moderate' | 'hard';
}

export function PlantIdentifier() {
  const [image, setImage] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleIdentify = async () => {
    if (!image) return;

    setIsIdentifying(true);
    try {
      const response = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });

      if (!response.ok) {
        throw new Error('Failed to identify plant');
      }

      const data = await response.json();
      setResult(data);
      toast.success(`Identified: ${data.commonName}`);
    } catch (error) {
      toast.error('Failed to identify plant. Please try again.');
      console.error('Identification error:', error);
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    moderate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        🔍 Plant Identifier
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Take or upload a photo of a plant to identify it and get care instructions.
      </p>

      {!image ? (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelect}
            className="hidden"
            id="plant-image-input"
          />
          <label
            htmlFor="plant-image-input"
            className="cursor-pointer flex flex-col items-center"
          >
            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-green-600 dark:text-green-400 font-medium">
              Take or upload a photo
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              JPG, PNG up to 10MB
            </span>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative aspect-square max-w-sm mx-auto rounded-lg overflow-hidden">
            <Image
              src={image}
              alt="Plant to identify"
              fill
              className="object-cover"
            />
          </div>

          {!result && (
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Choose Different Photo
              </button>
              <button
                onClick={handleIdentify}
                disabled={isIdentifying}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isIdentifying ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Identifying...
                  </>
                ) : (
                  'Identify Plant'
                )}
              </button>
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.commonName}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 italic">
                  {result.scientificName}
                </p>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <span className={`px-2 py-1 rounded-full text-sm ${difficultyColors[result.difficulty]}`}>
                    {result.difficulty} care
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {result.confidence}% confidence
                  </span>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300">{result.description}</p>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Care Guide</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <CareItem icon="💧" label="Water" value={result.careGuide.water} />
                  <CareItem icon="☀️" label="Light" value={result.careGuide.light} />
                  <CareItem icon="💨" label="Humidity" value={result.careGuide.humidity} />
                  <CareItem icon="🌡️" label="Temperature" value={result.careGuide.temperature} />
                  <CareItem icon="🪴" label="Soil" value={result.careGuide.soil} />
                  <CareItem icon="🧪" label="Fertilizer" value={result.careGuide.fertilizer} />
                </div>
              </div>

              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>⚠️ Toxicity:</strong> {result.toxicity}
                </p>
              </div>

              <button
                onClick={handleReset}
                className="w-full px-4 py-2 text-green-600 dark:text-green-400 border border-green-600 dark:border-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                Identify Another Plant
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CareItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500 dark:text-gray-400">
        {icon} {label}
      </p>
      <p className="text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
