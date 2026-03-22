'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export function CalendarSync() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/calendar');
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'growkeeper-schedule.ics';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Calendar exported! Import into your calendar app.');
    } catch (error) {
      toast.error('Failed to export calendar');
      console.error('Calendar export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const calendarUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/calendar`
    : '';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        📅 Calendar Sync
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Sync your plant care schedule with your favorite calendar app.
      </p>

      <div className="space-y-4">
        {/* Download iCal */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {isExporting ? 'Exporting...' : 'Download Calendar File (.ics)'}
        </button>

        {/* Calendar subscription URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Or subscribe via URL:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={calendarUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(calendarUrl);
                toast.success('URL copied to clipboard');
              }}
              className="px-3 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
          <p className="font-medium">How to use:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Google Calendar:</strong> Settings → Add calendar → From URL</li>
            <li><strong>Apple Calendar:</strong> File → New Calendar Subscription</li>
            <li><strong>Outlook:</strong> Add calendar → Subscribe from web</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
