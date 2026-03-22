/**
 * GrowKeeper Metrics Service
 * Tracks deterministic reliability indicators for sync, sensors, and AI.
 */

interface Metric {
  name: string;
  value: number;
  tags: Record<string, string>;
  timestamp: string;
}

class MetricsService {
  private static instance: MetricsService;
  private metrics: Metric[] = [];

  private constructor() {}

  static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  track(name: string, value: number, tags: Record<string, string> = {}) {
    const metric: Metric = {
      name,
      value,
      tags,
      timestamp: new Date().toISOString()
    };

    this.metrics.push(metric);

    // Development visibility
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Metric] ${name}: ${value}`, tags);
    }

    // Keep memory footprint low
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }
  }

  // Domain-specific helpers
  trackSyncLatency(latencyMs: number, provider: 'pouch' | 'yjs' | 'supabase') {
    this.track('sync_latency_ms', latencyMs, { provider });
  }

  trackSensorDisruption(sensorId: string, durationMs: number) {
    this.track('sensor_disruption_ms', durationMs, { sensorId });
  }

  trackAILatency(latencyMs: number, tier: 'edge' | 'cache' | 'cloud') {
    this.track('ai_latency_ms', latencyMs, { tier });
  }

  getMetricsSummary() {
    // Basic aggregation logic for the Investor HUD
    return {
      total: this.metrics.length,
      averageAILatency: this.getAverage('ai_latency_ms'),
      syncSuccessRate: this.calculateSuccessRate('sync_latency_ms'),
    };
  }

  private getAverage(name: string): number {
    const values = this.metrics.filter(m => m.name === name).map(m => m.value);
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  private calculateSuccessRate(name: string): number {
    const total = this.metrics.filter(m => m.name === name).length;
    if (total === 0) return 100;
    // For now, assume a value of -1 indicates failure
    const failures = this.metrics.filter(m => m.name === name && m.value === -1).length;
    return ((total - failures) / total) * 100;
  }
}

export const metrics = MetricsService.getInstance();
