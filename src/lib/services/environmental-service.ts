import { mycelialOrchestrator } from "./agents/mycelial-orchestrator";
import { BiologicalSpecimen } from "@/types/biological-intelligence";
import { EnvironmentalSentinelSignal, EnvironmentalSignalType, SignalSeverity } from "@/types/environmental";
import { createHash } from "crypto";
import { createClient } from "@/lib/supabase-server";
import { recordAuditEntry } from "@/lib/services/audit-ledger";

export type { EnvironmentalSentinelSignal };

const DEFAULT_THRESHOLDS = {
  frost_temp_c: 2,
  heat_temp_c: 35,
};

/**
 * Environmental Intelligence Service (v2.1.0 - Full Potential)
 * Deterministic Sentinel Agent #1 for registry-linked risk management.
 */

export interface RawWeatherData {
  temp_c: number;
  humidity: number;
  uv_index: number;
  wind_ms: number;
  precip_prob: number;
  forecast_start: string;
  forecast_end: string;
  advisory_codes: string[];
  buoy_temp_c?: number; // New: Marine sensor layer
}

/**
 * High-level interface for environmental data sources.
 * Supports swappable providers for NWS, Open-Meteo, and Mocks.
 */
export interface IEnvironmentalProvider {
  readonly name: string;
  isWithinCoverage(lat: number, lon: number): boolean;
  getRawWeather(lat: number, lon: number): Promise<RawWeatherData | null>;
}

/**
 * NWS/NOAA Adapter (Alpha Pilot Public Path)
 * Implementation of the National Weather Service API (keyless).
 */
class NWSProvider implements IEnvironmentalProvider {
  readonly name = "NWS/NOAA";

  isWithinCoverage(lat: number, lon: number): boolean {
    const inCONUS = lat >= 24.39 && lat <= 49.38 && lon >= -124.84 && lon <= -66.88;
    const inAlaska = lat >= 51.21 && lat <= 71.35 && lon >= -179.14 && lon <= -129.97;
    const inHawaii = lat >= 18.91 && lat <= 22.23 && lon >= -160.24 && lon <= -154.80;
    const inPR = lat >= 17.92 && lat <= 18.52 && lon >= -67.94 && lon <= -65.22;
    return inCONUS || inAlaska || inHawaii || inPR;
  }

  async getRawWeather(lat: number, lon: number): Promise<RawWeatherData | null> {
    if (!this.isWithinCoverage(lat, lon)) return null;

    try {
      // Step 1: Resolve Point (Keyless)
      const pointResponse = await fetch(`https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`, {
        headers: { 'User-Agent': '(growkeeper.app, contact@growkeeper.app)' }
      });
      
      if (!pointResponse.ok) return null;
      const pointData = await pointResponse.json();
      const forecastUrl = pointData.properties.forecast;

      // Step 2: Fetch Forecast
      const forecastResponse = await fetch(forecastUrl, {
        headers: { 'User-Agent': '(growkeeper.app, contact@growkeeper.app)' }
      });
      
      if (!forecastResponse.ok) return null;
      const forecastData = await forecastResponse.json();
      const period = forecastData.properties.periods[0];

      return {
        temp_c: (period.temperatureUnit === 'F' ? (period.temperature - 32) * 5 / 9 : period.temperature),
        humidity: period.relativeHumidity?.value || 50,
        uv_index: 0, // UV not directly in basic NWS forecast, needs GridData
        wind_ms: parseFloat(period.windSpeed) / 2.237, // mph to m/s approx
        precip_prob: period.probabilityOfPrecipitation?.value || 0,
        forecast_start: period.startTime,
        forecast_end: period.endTime,
        advisory_codes: [] // Needs Alert end-point for full fidelity
      };
    } catch (err) {
      console.error("[NWS_FETCH_FAULT]", err);
      return null;
    }
  }
}

/**
 * Mock Environmental Provider
 * For testing and deterministic simulation.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MockProvider implements IEnvironmentalProvider {
  readonly name = "MOCK_SENTINEL";

  isWithinCoverage(): boolean { return true; }

  async getRawWeather(): Promise<RawWeatherData | null> {
    return {
      temp_c: 1.5,
      humidity: 85,
      uv_index: 1,
      wind_ms: 4.2,
      precip_prob: 20,
      forecast_start: new Date().toISOString(),
      forecast_end: new Date(Date.now() + 21600000).toISOString(),
      advisory_codes: ["MOCK-FZ-W"]
    };
  }
}

export class EnvironmentalService {
  private static instance: EnvironmentalService;
  private provider: IEnvironmentalProvider;

  private constructor() {
    // Default to NWS for Alpha Pilot
    this.provider = new NWSProvider();
  }

  static getInstance() {
    if (!EnvironmentalService.instance) {
      EnvironmentalService.instance = new EnvironmentalService();
    }
    return EnvironmentalService.instance;
  }

  /**
   * Allows the operator to swap providers (e.g. for testing with MockProvider).
   */
  setProvider(provider: IEnvironmentalProvider) {
    this.provider = provider;
    console.log(`[ENVIRONMENTAL_SERVICE] Switched provider to: ${provider.name}`);
  }

  /**
   * Main Sentinel Orchestration Loop
   * Fetches data, runs rules, handles duplicate suppression, and persists signals.
   */
  async evaluateSpecimenRisk(specimen: BiologicalSpecimen): Promise<EnvironmentalSentinelSignal | null> {
    const { lat, lon, id: specimen_id } = specimen;
    const correlation_id = `sentinel_run_${Date.now()}`;

    if (lat === null || lon === null || lat === undefined || lon === undefined) {
      return this.handleNoCoverage(specimen_id, "Missing coordinates", correlation_id);
    }

    // Phase 1: Dynamic Weather Data Acquisition
    const rawData = await this.provider.getRawWeather(lat, lon);
    if (!rawData) {
      return this.handleNoCoverage(specimen_id, "Outside reach of atmospheric lattice", correlation_id);
    }

    // Phase 3: Federated Intelligence (Mycelial Orchestration)
    // We run the orchestrator to get a synthesized directive
    const synthesis = await mycelialOrchestrator.orchestrate(specimen as BiologicalSpecimen, []);

    // Phase 4: Deterministic Guard Logic
    const signals = this.runRuleEngine(specimen_id, rawData, correlation_id);
    
    // Inject Mycelial Synthesis into the primary signal if it exists
    if (signals.length > 0) {
      signals[0].operator_summary = `${signals[0].operator_summary}\n\n${synthesis.analysis}`;
      signals[0].provenance = 'ENVIRONMENTAL_AGENT';
    }

    for (const signal of signals) {
      await this.processSignal(signal);
    }

    return signals[0] || null;
  }

  private runRuleEngine(specimen_id: string, data: RawWeatherData, correlation_id: string): EnvironmentalSentinelSignal[] {
    const signals: EnvironmentalSentinelSignal[] = [];
    const observed_at = new Date().toISOString();

    // Rule 1: Frost Risk
    if (data.temp_c <= DEFAULT_THRESHOLDS.frost_temp_c) {
      signals.push(this.createSignal({
        specimen_id,
        type: 'FROST_RISK',
        severity: data.temp_c <= 0 ? 'CRITICAL' : 'HIGH',
        data,
        observed_at,
        correlation_id,
        summary: `Deterministic Frost Alert: ${data.temp_c}°C detected within forecast window.`
      }));
    }

    // Rule 2: Heat Stress
    if (data.temp_c >= DEFAULT_THRESHOLDS.heat_temp_c) {
      signals.push(this.createSignal({
        specimen_id,
        type: 'HEAT_STRESS',
        severity: data.temp_c >= 40 ? 'CRITICAL' : 'ELEVATED',
        data,
        observed_at,
        correlation_id,
        summary: `Heat Stress Signal: ${data.temp_c}°C may exceed core tolerance.`
      }));
    }

    return signals;
  }

  private createSignal(params: {
    specimen_id: string,
    type: EnvironmentalSignalType,
    severity: SignalSeverity,
    data: RawWeatherData,
    observed_at: string,
    correlation_id: string,
    summary: string
  }): EnvironmentalSentinelSignal {
    const { specimen_id, type, severity, data, observed_at, correlation_id, summary } = params;
    
    // Duplicate Suppression Key (Locked decision #5)
    const source_hash = createHash("sha256")
      .update(`${specimen_id}|${this.provider.name}|${type}|${data.forecast_start}`)
      .digest("hex");

    return {
      id: crypto.randomUUID(),
      specimen_id,
      provider: 'NWS/NOAA',
      signal_type: type,
      advisory_code: data.advisory_codes[0] || "GENERIC",
      severity,
      confidence_score: 100, // Deterministic NWS source
      provenance: 'ENVIRONMENTAL_AGENT',
      status: 'ACTIVE',
      observed_at,
      forecast_window_start: data.forecast_start,
      forecast_window_end: data.forecast_end,
      raw_source_ref: "https://api.weather.gov/points/...",
      source_hash,
      correlation_id,
      operator_summary: summary,
      created_at: observed_at
    };
  }

  private async processSignal(signal: EnvironmentalSentinelSignal) {
    const supabase = createClient();
    
    // 1. Duplicate Suppression (Locked decision #5)
    const { data: existing } = await supabase
      .from('environmental_signals')
      .select('id')
      .eq('source_hash', signal.source_hash)
      .eq('status', 'ACTIVE')
      .maybeSingle();

    if (existing) {
      await recordAuditEntry({
        action: "UPDATE",
        target: "registry",
        targetId: signal.specimen_id,
        metadata: { type: "ENV_SIGNAL_SUPPRESSED_DUPLICATE", signal_id: existing.id, source_hash: signal.source_hash },
        provenance: "ENVIRONMENTAL_AGENT"
      });
      return;
    }

    // 2. Persistence (Locked decision #2)
    const { error } = await supabase.from('environmental_signals').insert({
      ...signal,
      user_id: (await supabase.auth.getUser()).data.user?.id
    });

    if (!error) {
      await recordAuditEntry({
        action: "CREATE",
        target: "registry",
        targetId: signal.specimen_id,
        metadata: { type: "ENV_SIGNAL_CERTIFIED", signal_id: signal.id },
        provenance: "ENVIRONMENTAL_AGENT"
      });
    }
  }

  private async handleNoCoverage(specimen_id: string, reason: string, correlation_id: string): Promise<EnvironmentalSentinelSignal> {
    const signal: EnvironmentalSentinelSignal = {
        id: crypto.randomUUID(),
        specimen_id,
        provider: 'NWS/NOAA',
        signal_type: 'COVERAGE_CHECK',
        advisory_code: 'NO_COVERAGE',
        severity: 'NOMINAL',
        confidence_score: 0, // Locked decision #1
        provenance: 'ENVIRONMENTAL_AGENT',
        status: 'NO_COVERAGE',
        observed_at: new Date().toISOString(),
        forecast_window_start: new Date().toISOString(),
        forecast_window_end: new Date().toISOString(),
        raw_source_ref: "N/A",
        source_hash: `NC_${specimen_id}`,
        correlation_id,
        operator_summary: `Coverage Boundary: Alpha Pilot scope does not cover this coordinate (${reason}).`,
        created_at: new Date().toISOString()
    };

    await recordAuditEntry({
        action: "UPDATE",
        target: "registry",
        targetId: specimen_id,
        metadata: { type: "ENV_SIGNAL_NO_COVERAGE", reason },
        provenance: "ENVIRONMENTAL_AGENT"
    });

    return signal;
  }
}
