// Analytics service for GrowKeeper
// Supports Vercel Analytics + custom event tracking

type EventName =
  | 'plant_added'
  | 'plant_deleted'
  | 'care_logged'
  | 'task_completed'
  | 'badge_earned'
  | 'level_up'
  | 'diagnosis_requested'
  | 'bulk_water'
  | 'plant_search'
  | 'theme_changed'
  | 'language_changed';

interface AnalyticsEvent {
  name: EventName;
  properties?: Record<string, string | number | boolean>;
}

declare global {
  interface Window {
    va?: (type: string, data: Record<string, unknown>) => void;
  }
}

class Analytics {
  private queue: AnalyticsEvent[] = [];
  private isInitialized = false;

  init() {
    this.isInitialized = true;
    // Process queued events
    this.queue.forEach((event) => this.sendEvent(event));
    this.queue = [];
  }

  track(name: EventName, properties?: Record<string, string | number | boolean>) {
    const event: AnalyticsEvent = { name, properties };

    if (this.isInitialized) {
      this.sendEvent(event);
    } else {
      this.queue.push(event);
    }
  }

  private sendEvent(event: AnalyticsEvent) {
    // Send to Vercel Analytics if available
    if (typeof window !== 'undefined' && window.va) {
      window.va('event', {
        name: event.name,
        ...event.properties,
      });
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event.name, event.properties);
    }
  }

  // Page view tracking
  pageView(path: string) {
    if (typeof window !== 'undefined' && window.va) {
      window.va('pageview', { path });
    }
  }

  // User identification (for authenticated users)
  identify(userId: string, traits?: Record<string, string>) {
    if (typeof window !== 'undefined' && window.va) {
      window.va('identify', { userId, ...traits });
    }
  }
}

export const analytics = new Analytics();

// React hook for analytics
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    pageView: analytics.pageView.bind(analytics),
    identify: analytics.identify.bind(analytics),
  };
}

// Server-side analytics helper
export async function trackServerEvent(
  name: EventName,
  properties?: Record<string, string | number | boolean>
) {
  // In production, you might send this to your analytics backend
  if (process.env.NODE_ENV === 'development') {
    console.log('[Server Analytics]', name, properties);
  }
  
  // Example: Send to analytics API
  // await fetch('/api/analytics', {
  //   method: 'POST',
  //   body: JSON.stringify({ name, properties, timestamp: Date.now() }),
  // });
}
