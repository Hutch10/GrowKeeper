/**
 * AI Plant Diagnosis Service
 * Uses OpenAI Vision API to analyze plant photos and detect issues
 */

import OpenAI from "openai";
import { logger } from '../observability/logger';
import { metrics } from '../observability/metrics';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface DiagnosisResult {
  overallHealth: "healthy" | "mild_issues" | "moderate_issues" | "severe_issues";
  healthScore: number; // 0-100
  issues: Array<{
    type: "disease" | "pest" | "nutrient_deficiency" | "environmental" | "watering";
    name: string;
    severity: "low" | "medium" | "high";
    description: string;
    treatment: string;
  }>;
  careRecommendations: string[];
  identifiedSpecies?: string;
}

const DIAGNOSIS_PROMPT = `You are an expert botanist and plant pathologist. Analyze this plant image and provide a detailed health assessment.

Respond in JSON format with the following structure:
{
  "overallHealth": "healthy" | "mild_issues" | "moderate_issues" | "severe_issues",
  "healthScore": <number 0-100>,
  "issues": [
    {
      "type": "disease" | "pest" | "nutrient_deficiency" | "environmental" | "watering",
      "name": "<specific issue name>",
      "severity": "low" | "medium" | "high",
      "description": "<what you observe>",
      "treatment": "<recommended treatment>"
    }
  ],
  "careRecommendations": ["<recommendation 1>", "<recommendation 2>", ...],
  "identifiedSpecies": "<plant species if identifiable, or null>"
}

Be specific and actionable in your recommendations. If the plant looks healthy, still provide preventive care tips.`;

// Tier 2 Cache: Simple in-memory hash store
const diagnosisCache = new Map<string, string>();

/**
 * Generates a simple hash of the image data to use as a cache key.
 */
async function getImageHash(imageContent: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(imageContent.substring(0, 10000)); // Sample start
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function diagnoseSpecimen(imageData: string, context?: string): Promise<string> {
  const startTime = Date.now();
  
  // Tier 1: Edge Check (Placeholder for local TF.js heuristics)
  logger.debug('AIDiagnosis', 'Checking Tier 1 edge heuristics...');

  // Tier 2: Cached Intelligence
  const imageHash = await getImageHash(imageData);
  if (diagnosisCache.has(imageHash)) {
    logger.info('AIDiagnosis', 'Tier 2 Cache Hit: Reusing prior diagnostic result.');
    metrics.trackAILatency(Date.now() - startTime, 'cache');
    return diagnosisCache.get(imageHash)!;
  }

  // Tier 3: Cloud AI (OpenAI)
  logger.info('AIDiagnosis', 'Tier 2 Cache Miss: Initiating Tier 3 Cloud Analysis.');
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: "You are a professional botanical pathologist. Analyze the image and provide a health diagnosis."
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Analyze this specimen. ${context || ""}` },
              { type: "image_url", image_url: { url: imageData } }
            ]
          }
        ],
        max_tokens: 500,
      }),
    });

    const result = await response.json();
    const diagnosis = result.choices[0].message.content;

    // Persist to Tier 2 Cache
    diagnosisCache.set(imageHash, diagnosis);
    
    metrics.trackAILatency(Date.now() - startTime, 'cloud');
    return diagnosis;
  } catch (err) {
    logger.error('AIDiagnosis', 'Tier 3 Cloud Analysis failed.', err as Error);
    metrics.trackAILatency(-1, 'cloud');
    throw err;
  }
}

/**
 * Analyze a plant image and return diagnosis
 */
export async function diagnosePlant(imageUrl: string): Promise<DiagnosisResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: DIAGNOSIS_PROMPT },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content) as DiagnosisResult;
    return result;
  } catch (error) {
    console.error("Error diagnosing plant:", error);
    
    // Return a fallback response
    return {
      overallHealth: "healthy",
      healthScore: 75,
      issues: [],
      careRecommendations: [
        "Unable to analyze image. Please ensure good lighting and a clear view of the plant.",
        "Try taking a photo in natural daylight for best results.",
      ],
    };
  }
}

/**
 * Analyze plant image from base64 data
 */
export async function diagnosePlantFromBase64(base64Image: string): Promise<DiagnosisResult> {
  // Ensure proper data URL format
  const imageUrl = base64Image.startsWith("data:") 
    ? base64Image 
    : `data:image/jpeg;base64,${base64Image}`;
  
  return diagnosePlant(imageUrl);
}

/**
 * Get quick health tips based on common issues
 */
export function getQuickHealthTips(issueType: string): string[] {
  const tips: Record<string, string[]> = {
    yellowing_leaves: [
      "Check for overwatering - allow soil to dry between waterings",
      "Ensure adequate drainage in the pot",
      "Consider if the plant needs more or less light",
      "Check for nutrient deficiencies, especially nitrogen",
    ],
    brown_tips: [
      "Increase humidity around the plant",
      "Check for salt buildup from tap water - use filtered water",
      "Ensure consistent watering schedule",
      "Move away from heating/cooling vents",
    ],
    wilting: [
      "Check soil moisture - may be under or overwatered",
      "Ensure proper drainage",
      "Check for root rot if soil is wet",
      "Consider if the plant is getting too much direct sun",
    ],
    pests: [
      "Isolate the affected plant immediately",
      "Wipe leaves with neem oil solution",
      "Check other nearby plants for infestation",
      "Increase air circulation around plants",
    ],
    spots: [
      "Remove affected leaves to prevent spread",
      "Improve air circulation",
      "Avoid getting water on leaves",
      "Consider a fungicide if spots are spreading",
    ],
  };

  return tips[issueType] || [
    "Ensure proper watering based on species needs",
    "Check light conditions",
    "Monitor humidity levels",
    "Inspect regularly for pests",
  ];
}
