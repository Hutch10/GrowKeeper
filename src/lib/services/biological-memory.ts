/**
 * Biological Memory System (Phase 6)
 * Persistent constraints and knowledge base for Specialist Agents.
 */
export interface BiologicalRule {
  id: string;
  genus: string;
  rule_type: 'CONSTRAINT' | 'OPTIMIZATION' | 'CRITICAL_FAILURE';
  condition: (context: { moisture: number; temp: number }) => boolean;
  message: string;
}

export const BIOLOGICAL_RULES: Record<string, BiologicalRule[]> = {
  "Monstera": [
    {
      id: "monstera_hydration_cap",
      genus: "Monstera",
      rule_type: "CONSTRAINT",
      condition: (ctx) => ctx.moisture > 0.8,
      message: "Prohibit irrigation: Moisture level exceeds 80% capacity (Root Rot risk)."
    },
    {
      id: "monstera_thermal_optima",
      genus: "Monstera",
      rule_type: "OPTIMIZATION",
      condition: (ctx) => ctx.temp < 18,
      message: "Biological Efficiency Warning: Ambient temperature below 18°C slows metabolic rate."
    }
  ],
  "Sansevieria": [
    {
      id: "sansevieria_arid_protocol",
      genus: "Sansevieria",
      rule_type: "CONSTRAINT",
      condition: (ctx) => ctx.moisture > 0.4,
      message: "Prohibit irrigation: Substrate saturation exceeds 40% (Arid Genus Requirement)."
    }
  ],
  "Default": [
    {
      id: "generic_overwatering",
      genus: "Default",
      rule_type: "CONSTRAINT",
      condition: (ctx) => ctx.moisture > 0.9,
      message: "Critical Constraint: Prohibit all irrigation at 90% saturation."
    }
  ]
};

/**
 * Validates a proposed action against Biological Memory constraints.
 */
export function validateBiologicalConstraint(
  genus: string,
  context: { moisture: number; temp: number }
): { allowed: boolean; violations: string[] } {
  const rules = BIOLOGICAL_RULES[genus] || BIOLOGICAL_RULES["Default"];
  const violations = rules
    .filter(rule => rule.rule_type === "CONSTRAINT" && rule.condition(context))
    .map(rule => rule.message);

  return {
    allowed: violations.length === 0,
    violations
  };
}

/**
 * Retrieves optimization insights for a given biological context.
 */
export function getBiologicalInsights(
  genus: string,
  context: { moisture: number; temp: number }
): string[] {
  const rules = BIOLOGICAL_RULES[genus] || BIOLOGICAL_RULES["Default"];
  return rules
    .filter(rule => rule.rule_type === "OPTIMIZATION" && rule.condition(context))
    .map(rule => rule.message);
}
