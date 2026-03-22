'use client';

import { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';

interface TimelinePhoto {
  id: string;
  url: string;
  date: string;
  notes?: string;
}

interface PhotoTimelineProps {
  photos: TimelinePhoto[];
  onAddPhoto?: () => void;
}

export function PhotoTimeline({ photos, onAddPhoto }: PhotoTimelineProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<TimelinePhoto | null>(null);

  if (photos.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Growth Timeline</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📸</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Track your plant&apos;s growth with photos
          </p>
          {onAddPhoto && (
            <button
              onClick={onAddPhoto}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add First Photo
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Growth Timeline</h3>
        {onAddPhoto && (
          <button
            onClick={onAddPhoto}
            className="text-sm text-green-600 hover:text-green-700 dark:text-green-400"
          >
            + Add Photo
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
        
        <div className="space-y-6">
          {photos.map((photo) => (
            <div key={photo.id} className="relative flex gap-4">
              {/* Timeline dot */}
              <div className="relative z-10 w-8 h-8 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-white dark:ring-gray-800" />
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {format(new Date(photo.date), 'MMM d, yyyy')}
                </div>
                <button
                  onClick={() => setSelectedPhoto(photo)}
                  aria-label="View photo detail"
                  className="relative w-full max-w-xs aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-green-500 transition-all"
                >
                  <Image
                    src={photo.url}
                    alt={`Plant photo from ${photo.date}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 320px) 100vw, 320px"
                  />
                </button>
                {photo.notes && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {photo.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setSelectedPhoto(null)}
              aria-label="Close photo detail"
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Image
              src={selectedPhoto.url}
              alt="Plant photo"
              width={800}
              height={800}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <div className="text-center mt-4 text-white">
              <p className="text-lg">{format(new Date(selectedPhoto.date), 'MMMM d, yyyy')}</p>
              {selectedPhoto.notes && <p className="text-gray-300">{selectedPhoto.notes}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
