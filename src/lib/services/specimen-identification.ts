// Specimen Identification Service using OpenAI Vision API

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export interface SpecimenIdentificationResult {
  commonName: string;
  scientificName: string;
  kingdom: 'Plantae' | 'Fungi' | 'Animalia' | 'Other';
  confidence: number;
  careGuide: {
    watering_or_misting?: string;
    light?: string;
    humidity?: string;
    temperature?: string;
    substrate_or_soil?: string;
    fertilizer_or_supplements?: string;
    dietary_notes?: string;
    activity_needs?: string;
  };
  description: string;
  toxicity: string;
  difficulty: 'easy' | 'moderate' | 'hard';
}

export async function identifySpecimen(imageBase64: string): Promise<SpecimenIdentificationResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert biologist and multi-kingdom specimen identification specialist. 
When shown an image of a biological specimen (plant, fungus, animal, etc.), identify it and provide detailed care information.
Determine the kingdom first: Plantae, Fungi, Animalia, or Other.

Always respond with valid JSON in this exact format:
{
  "commonName": "string",
  "scientificName": "string",
  "kingdom": "Plantae" | "Fungi" | "Animalia" | "Other",
  "confidence": number (0-100),
  "careGuide": {
    "watering_or_misting": "string - watering for plants, misting for fungi, hydration for animals",
    "light": "string - light requirements (if applicable, else omit)",
    "humidity": "string - humidity preferences (if applicable)",
    "temperature": "string - ideal temperature range",
    "substrate_or_soil": "string - soil for plants, substrate for fungi (if applicable)",
    "fertilizer_or_supplements": "string - fertilizer for plants/fungi, supplements for animals (if applicable)",
    "dietary_notes": "string - dietary requirements (only for Animalia)",
    "activity_needs": "string - exercise or movement requirements (only for Animalia)"
  },
  "description": "string - brief description of the specimen",
  "toxicity": "string - toxic to pets/humans or safe",
  "difficulty": "easy" | "moderate" | "hard"
}`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please identify this specimen and provide detailed care information. Respond only with JSON.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to identify specimen');
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No response from AI');
  }

  try {
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    return JSON.parse(jsonMatch[0]) as SpecimenIdentificationResult;
  } catch {
    throw new Error('Failed to parse identification results');
  }
}
