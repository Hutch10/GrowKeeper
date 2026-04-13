import { 
  EnvironmentalSentinelSignal, 
  EnvironmentalSignalType, 
  DEFAULT_THRESHOLDS,
  SignalSeverity
} from "@/types/environmental";

/**
 * Environmental Signal Interpreter Skill
 * Logic-only unit that translates raw telemetry into risk-weighted guidance.
 */

export interface WeatherGuidance {
  guidance: string;
  field_instruction: string;
  interpreted_severity: SignalSeverity;
}

export class EnvironmentalSignalInterpreter {
  /**
   * Interprets a signal and returns field-ready guidance.
   */
  static interpret(signal: EnvironmentalSentinelSignal): WeatherGuidance {
    const { signal_type, severity } = signal;

    switch (signal_type) {
      case "FROST_RISK":
        return {
          guidance: "Immediate risk of cellular crystallization. Biological tissue damage likely without intervention.",
          field_instruction: "Deploy thermal cloches or relocate mobile specimens to climate-controlled zones.",
          interpreted_severity: severity
        };
      
      case "HEAT_STRESS":
        return {
          guidance: "Ambient temperature exceeds metabolic safety threshold. Transpiration failure imminent.",
          field_instruction: "Initiate maximum hydration protocol and deploy temporary shade canopy.",
          interpreted_severity: severity
        };

      case "GEOFENCE_BREACH":
        return {
          guidance: "Biological asset detected outside of authorized operational geofence.",
          field_instruction: "Perform immediate site recovery. Verify geofence integrity in Registry.",
          interpreted_severity: "CRITICAL"
        };

      case "COVERAGE_CHECK":
        if (signal.advisory_code === "NO_COVERAGE") {
          return {
            guidance: "Asset is outside Alpha Pilot coverage boundary (NWS/NOAA scope).",
            field_instruction: "Manual monitoring required. NWS Sentinel cannot certify risk for these coordinates.",
            interpreted_severity: "NOMINAL"
          };
        }
        break;
    }

    return {
      guidance: "Environmental conditions are within nominal operational parameters.",
      field_instruction: "No immediate field intervention required. Maintain standard care schedule.",
      interpreted_severity: "NOMINAL"
    };
  }

  /**
   * Static rule engine for raw data evaluation.
   */
  static evaluate(temp_c: number): { type: EnvironmentalSignalType; severity: SignalSeverity }[] {
    const findings: { type: EnvironmentalSignalType; severity: SignalSeverity }[] = [];

    if (temp_c <= DEFAULT_THRESHOLDS.frost_temp_c) {
      findings.push({ 
        type: 'FROST_RISK', 
        severity: temp_c <= 0 ? 'CRITICAL' : 'HIGH' 
      });
    }

    if (temp_c >= DEFAULT_THRESHOLDS.heat_temp_c) {
      findings.push({ 
        type: 'HEAT_STRESS', 
        severity: temp_c >= 40 ? 'CRITICAL' : 'ELEVATED' 
      });
    }

    return findings;
  }
}
