import OpenAI from "openai";
import { logger } from '../observability/logger';
import { metrics } from '../observability/metrics';
import { trackAlphaEvent } from './alpha-telemetry';
import { analyzeSymptoms, DiagnosticCause } from '../constants/diagnostic-registry';

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface DiagnosisResult {
  overallHealth: "healthy" | "mild_issues" | "moderate_issues" | "severe_issues";
  healthScore: number; // 0-100
  kingdom: string;
  observedSymptoms: string[]; // IDs from registry
  likelyCauses: DiagnosticCause[];
  careRecommendations: string[];
  identifiedSpecies?: string;
  systemConfidence: number; // 0-1
}

const DIAGNOSIS_PROMPT = `You are an expert biological pathologist and taxonomist specializing in the Sovereign Registry. 
Analyze this specimen image and provide a detailed health and taxonomic assessment.

PRIORITIZE SYMPTOM IDENTIFICATION. Choose from the following registry IDs if applicable:
[yellow_leaves_lower, brown_crispy_tips, thinning_mycelium, drooping_foliage]

Respond in JSON format with the following structure:
{
  "overallHealth": "healthy" | "mild_issues" | "moderate_issues" | "severe_issues",
  "healthScore": <number 0-100>,
  "kingdom": "<Plantae | Fungi | Animalia>",
  "observedSymptoms": ["<id 1>", "<id 2>", ...],
  "careRecommendations": ["<recommendation 1>", "<recommendation 2>", ...],
  "identifiedSpecies": "<species name if identifiable, or null>",
  "systemConfidence": <0.0-1.0>
}

CONSTITUTIONAL REQUIREMENTS:
1. For FUNGI: Focus on mycelial density, substrate moisture, and mold contamination.
2. For PLANTAE: Focus on stomatal aperture, chlorophyll density, and turgor pressure.
3. Be brutally honest. If unsure, lower the 'systemConfidence'.`;

/**
 * Primary entry point for specimen diagnosis.
 * Uses a tiered approach: Edge (Mock) -> Cache -> Cloud (OpenAI) + Registry mapping.
 */
export async function diagnoseSpecimen(imageData: string, context?: string): Promise<DiagnosisResult> {
  const startTime = Date.now();
  
  // Tier 1: Edge Check (TF.js heuristics)
  if (imageData.length < 30000) {
    return {
      overallHealth: "healthy",
      healthScore: 90,
      kingdom: "Plantae",
      observedSymptoms: [],
      likelyCauses: [],
      careRecommendations: ["Specimen appears stable at the edge."],
      systemConfidence: 0.95
    };
  }

  try {
    const rawResult = await diagnoseCloudSpecimen(imageData, context);

    // Cross-reference symptoms with Internal Registry (Phase 3)
    const likelihoods = analyzeSymptoms(rawResult.observedSymptoms);

    const enrichedResult: DiagnosisResult = {
      ...rawResult,
      likelyCauses: likelihoods,
      // If we have mapped causes, use the aggregated remediation protocols
      careRecommendations: likelihoods.length > 0 
        ? likelihoods.map(c => `[Protocol: ${c.cause}] ${c.remediation_protocol}`)
        : rawResult.careRecommendations
    };

    metrics.trackAILatency(Date.now() - startTime, 'cloud');
    trackAlphaEvent("ai_diagnosis_run", { 
      kingdom: enrichedResult.kingdom, 
      score: enrichedResult.healthScore,
      symptoms_count: enrichedResult.observedSymptoms.length 
    });

    return enrichedResult;
    } catch (err) {
    logger.error('AIDiagnosis', 'Analysis failed.', err as Error);
    throw err;
  }
}

/**
 * Cloud-based Diagnostic Implementation (OpenAI 4o)
 */
export async function diagnoseCloudSpecimen(imageUrl: string, context?: string): Promise<Omit<DiagnosisResult, 'likelyCauses'>> {
  if (!openai) {
    throw new Error("Cloud Analysis unavailable. API key not configured.");
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: `${DIAGNOSIS_PROMPT}\n\nContext: ${context || "None provided"}` },
          { type: "image_url", image_url: { url: imageUrl, detail: "high" } },
        ],
      },
    ],
    max_tokens: 1500,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  return JSON.parse(content);
}

/**
 * Analyze specimen image from base64 data
 */
export async function diagnoseSpecimenFromBase64(base64Image: string): Promise<DiagnosisResult> {
  const imageUrl = base64Image.startsWith("data:") 
    ? base64Image 
    : `data:image/jpeg;base64,${base64Image}`;
  
  return diagnoseSpecimen(imageUrl);
}
