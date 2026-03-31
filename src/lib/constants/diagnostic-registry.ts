"use client";

/**
 * Diagnostic Likelihood Registry (Phase 3)
 * Maps observed biological symptoms to probable causes with statistical confidence.
 */
export interface DiagnosticCause {
  cause: string;
  probability: number; // 0-1
  treatment_category: "hydration" | "nutrients" | "environmental" | "pathological" | "metabolic";
  remediation_protocol: string;
}

export interface SymptomDefinition {
  id: string;
  label: string;
  likelihood_map: DiagnosticCause[];
}

export const DIAGNOSTIC_REGISTRY: Record<string, SymptomDefinition> = {
  "yellow_leaves_lower": {
    id: "yellow_leaves_lower",
    label: "Yellowing (Lower Leaves)",
    likelihood_map: [
      { cause: "Nitrogen Deficiency", probability: 0.7, treatment_category: "nutrients", remediation_protocol: "Apply high-nitrogen organic feed (NPK 3-1-2)." },
      { cause: "Natural Senescence", probability: 0.2, treatment_category: "metabolic", remediation_protocol: "None - Monitor new growth for stability." },
      { cause: "Overwatering (Root Stress)", probability: 0.1, treatment_category: "hydration", remediation_protocol: "Extend dry-back period; check drainage." }
    ]
  },
  "brown_crispy_tips": {
    id: "brown_crispy_tips",
    label: "Brown/Crispy Leaf Tips",
    likelihood_map: [
      { cause: "Low Humidity Stress", probability: 0.6, treatment_category: "environmental", remediation_protocol: "Increase ambient humidity to >50%." },
      { cause: "Salt Accumulation", probability: 0.3, treatment_category: "nutrients", remediation_protocol: "Flush substrate with distilled/filtered water." },
      { cause: "Underwatering", probability: 0.1, treatment_category: "hydration", remediation_protocol: "Normalize irrigation frequency." }
    ]
  },
  "thinning_mycelium": {
    id: "thinning_mycelium",
    label: "Mycelial Thinning/Transparency",
    likelihood_map: [
      { cause: "CO2 Buildup", probability: 0.5, treatment_category: "environmental", remediation_protocol: "Increase Fresh Air Exchange (FAE) frequency." },
      { cause: "Substrate Exhaustion", probability: 0.3, treatment_category: "nutrients", remediation_protocol: "Assess casing layer; consider re-hydration." },
      { cause: "Competitor Contamination", probability: 0.2, treatment_category: "pathological", remediation_protocol: "Isolate specimen; check for Trichoderma signals." }
    ]
  },
  "drooping_foliage": {
    id: "drooping_foliage",
    label: "Turgor Loss / Drooping",
    likelihood_map: [
      { cause: "Critical Dehydration", probability: 0.8, treatment_category: "hydration", remediation_protocol: "Immediate bottom-watering or saturation." },
      { cause: "Thermal Shock", probability: 0.2, treatment_category: "environmental", remediation_protocol: "Normalize temperature within genal range (18-26°C)." }
    ]
  }
};

/**
 * Derives the most likely cause from a set of observed symptoms.
 */
export function analyzeSymptoms(symptomIds: string[]): DiagnosticCause[] {
  const aggregatedResults: Record<string, DiagnosticCause> = {};
  
  symptomIds.forEach(id => {
    const definition = DIAGNOSTIC_REGISTRY[id];
    if (definition) {
      definition.likelihood_map.forEach(item => {
        if (!aggregatedResults[item.cause]) {
          aggregatedResults[item.cause] = { ...item };
        } else {
          // Bayesian-lite: combine probabilities (simplified for now)
          aggregatedResults[item.cause].probability = Math.min(0.99, aggregatedResults[item.cause].probability + (item.probability * 0.2));
        }
      });
    }
  });

  return Object.values(aggregatedResults).sort((a, b) => b.probability - a.probability);
}
