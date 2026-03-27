import OpenAI from "openai";
import { specimensDB } from "@/lib/pouchdb";
import type { SpecimenRow } from "@/app/actions/types";

let _openai: OpenAI | null = null;

function getOpenAI() {
  if (_openai) return _openai;
  
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("[Concierge] OPENAI_API_KEY is missing. AI features will be disabled.");
    return null;
  }

  _openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // Required if used on client, though not recommended for secrets
  });
  return _openai;
}

/**
 * Botanical Concierge Service
 * Provides conversational expertise and automated specimen management.
 */
class BotanicalConciergeService {
  private systemPrompt = `You are the GrowKeeper Botanical Concierge, a world-class expert in botany, mycology, and indoor gardening. 
  Your goal is to provide precise, tactical, and encouraging care advice. 
  You have access to the user's specific specimen data when provided. 
  Always be concise, professional, and highlight $100M-valuation quality insights.`;

  /**
   * Ask a care question with optional specimen context
   */
  async askConcierge(query: string, specimenId?: string): Promise<string> {
    let contextStr = "";

    if (specimenId) {
      try {
        const specimen = await specimensDB.get(specimenId) as unknown as SpecimenRow;
        contextStr = `\nContext: User is asking about their specimen "${specimen.nickname}" (${specimen.species_name || "Unknown species"}). 
        Current moisture: ${Math.round((specimen.telemetry?.moisture || 0) * 100)}%, Light: ${Math.round((specimen.telemetry?.light || 0) * 100)}%, Temp: ${specimen.telemetry?.temperature || 22}°C. 
        Current health: ${specimen.health}%.`;
      } catch (err) {
        console.warn("[Concierge] Could not fetch specimen context:", err);
      }
    }

    const client = getOpenAI();
    if (!client) {
      return "The Botanical Concierge is waiting for its API credentials. Please configure OPENAI_API_KEY.";
    }

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: this.systemPrompt + contextStr },
          { role: "user", content: query }
        ],
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content || "I'm having trouble connecting to my botanical database. Please check your network.";
    } catch (err) {
      console.error("[Concierge] API Error:", err);
      return "The Concierge is currently offline for a growth cycle. Please try again in a moment.";
    }
  }

  /**
   * Identifies a specimen from an image and prepares a digital twin log
   */
  async identifyAndLog(imageUrl: string): Promise<{ species: string; confidence: number; suggestedCare: string }> {
    const client = getOpenAI();
    if (!client) throw new Error("OpenAI client not initialized. Missing API key.");

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Identify this plant or fungus. Be extremely precise with the scientific name. Provide a 1-sentence care summary." },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 500,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response");

      // Mocking the structure for now since gpt-4o response formats can vary
      return JSON.parse(content);
    } catch (err) {
      console.error("[Concierge] Identification Error:", err);
      throw err;
    }
  }
}

export const concierge = new BotanicalConciergeService();
