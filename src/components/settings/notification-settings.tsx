'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { pushService } from '@/lib/services/push-notifications';

export function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
        const initialized = await pushService.init();
        if (initialized) {
          setIsSubscribed(pushService.isSubscribed());
        }
      }
    };
    
    checkSupport();
  }, []);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (isSubscribed) {
        await pushService.unsubscribe();
        setIsSubscribed(false);
        toast.success('Push notifications disabled');
      } else {
        await pushService.subscribe();
        setIsSubscribed(true);
        setPermission('granted');
        toast.success('Push notifications enabled!');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('denied')) {
        setPermission('denied');
        toast.error('Please enable notifications in your browser settings');
      } else {
        toast.error('Failed to update notification settings');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Push Notifications
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Push notifications are not supported in your browser.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Push Notifications
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Get reminders when your plants need care, even when the app is closed.
      </p>

      {permission === 'denied' ? (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-300 text-sm">
          <p className="font-medium">Notifications blocked</p>
          <p>Please enable notifications in your browser settings to receive reminders.</p>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isSubscribed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <svg 
                className={`w-5 h-5 ${isSubscribed ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                />
              </svg>
            </div>
            <span className="text-gray-700 dark:text-gray-300">
              {isSubscribed ? 'Notifications enabled' : 'Enable notifications'}
            </span>
          </div>
          
          <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isSubscribed ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isSubscribed ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );
}
