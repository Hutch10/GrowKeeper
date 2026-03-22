import { ExportData } from '@/components/settings/export-data';
import { NotificationSettings } from '@/components/settings/notification-settings';
import { CalendarSync } from '@/components/settings/calendar-sync';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { cookies } from 'next/headers';

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'en';

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Settings
      </h1>

      <div className="space-y-6">
        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 dark:text-gray-300">Theme</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose between light and dark mode
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Language */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Language
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 dark:text-gray-300">Display Language</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select your preferred language
              </p>
            </div>
            <LanguageSwitcher currentLocale={locale} />
          </div>
        </div>

        {/* Notifications */}
        <NotificationSettings />

        {/* Calendar Sync */}
        <CalendarSync />

        {/* Data Export */}
        <ExportData />

        {/* About */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            About GrowKeeper
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your personal plant care companion. Track watering schedules, monitor plant health, 
            and never forget to care for your green friends.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Version 1.0.0</p>
            <p>Made with 💚 by Matrix Agent</p>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Keyboard Shortcuts
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Go to Dashboard</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">G then H</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Go to Plants</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">G then P</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Go to Tasks</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">G then T</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Go to Reminders</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">G then R</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Add New Plant</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">N</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Search</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">/</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
