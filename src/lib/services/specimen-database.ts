/**
 * Specimen Database Service
 * Provides species-specific care information
 */

export interface SpecimenSpeciesInfo {
  id: number;
  commonName: string;
  scientificName: string;
  family: string;
  watering: "frequent" | "average" | "minimum" | "none";
  wateringDescription: string;
  sunlight: string[];
  cycle: string;
  careLevel: "low" | "medium" | "high";
  description: string;
  imageUrl?: string;
  poisonousToHumans: boolean;
  poisonousToPets: boolean;
  indoor: boolean;
  growthRate: string;
  maintenance: string;
}

export interface SpecimenSearchResult {
  id: number;
  commonName: string;
  scientificName: string;
  imageUrl?: string;
}

// Built-in specimen database
const COMMON_SPECIMENS: Record<string, SpecimenSpeciesInfo> = {
  "pothos": {
    id: 1,
    commonName: "Pothos",
    scientificName: "Epipremnum aureum",
    family: "Araceae",
    watering: "average",
    wateringDescription: "Water when the top inch of soil is dry. Typically every 1-2 weeks.",
    sunlight: ["part shade", "filtered light"],
    cycle: "Perennial",
    careLevel: "low",
    description: "One of the easiest houseplants to grow. Tolerates low light and irregular watering.",
    poisonousToHumans: true,
    poisonousToPets: true,
    indoor: true,
    growthRate: "Fast",
    maintenance: "Low",
  },
  "snake plant": {
    id: 2,
    commonName: "Snake Plant",
    scientificName: "Sansevieria trifasciata",
    family: "Asparagaceae",
    watering: "minimum",
    wateringDescription: "Allow soil to dry completely between waterings. Every 2-6 weeks depending on conditions.",
    sunlight: ["full sun", "part shade", "filtered light"],
    cycle: "Perennial",
    careLevel: "low",
    description: "Extremely hardy plant that can survive neglect. Great air purifier.",
    poisonousToHumans: true,
    poisonousToPets: true,
    indoor: true,
    growthRate: "Slow",
    maintenance: "Low",
  },
  "monstera": {
    id: 3,
    commonName: "Monstera",
    scientificName: "Monstera deliciosa",
    family: "Araceae",
    watering: "average",
    wateringDescription: "Water when top 2 inches of soil are dry. Every 1-2 weeks.",
    sunlight: ["part shade", "filtered light"],
    cycle: "Perennial",
    careLevel: "medium",
    description: "Popular tropical plant known for its distinctive split leaves.",
    poisonousToHumans: true,
    poisonousToPets: true,
    indoor: true,
    growthRate: "Fast",
    maintenance: "Medium",
  },
  "fiddle leaf fig": {
    id: 4,
    commonName: "Fiddle Leaf Fig",
    scientificName: "Ficus lyrata",
    family: "Moraceae",
    watering: "average",
    wateringDescription: "Water when top inch is dry. Consistent watering is key - every 7-10 days.",
    sunlight: ["filtered light"],
    cycle: "Perennial",
    careLevel: "high",
    description: "Dramatic statement plant with large, violin-shaped leaves. Requires consistent care.",
    poisonousToHumans: true,
    poisonousToPets: true,
    indoor: true,
    growthRate: "Medium",
    maintenance: "High",
  },
  "peace lily": {
    id: 5,
    commonName: "Peace Lily",
    scientificName: "Spathiphyllum",
    family: "Araceae",
    watering: "frequent",
    wateringDescription: "Keep soil consistently moist. Water when top inch is dry, typically weekly.",
    sunlight: ["part shade", "filtered light"],
    cycle: "Perennial",
    careLevel: "low",
    description: "Beautiful flowering plant that thrives in low light. Excellent air purifier.",
    poisonousToHumans: true,
    poisonousToPets: true,
    indoor: true,
    growthRate: "Medium",
    maintenance: "Low",
  },
  "spider plant": {
    id: 6,
    commonName: "Spider Plant",
    scientificName: "Chlorophytum comosum",
    family: "Asparagaceae",
    watering: "average",
    wateringDescription: "Water thoroughly when top inch is dry. Every 1-2 weeks.",
    sunlight: ["part shade", "filtered light"],
    cycle: "Perennial",
    careLevel: "low",
    description: "Resilient plant that produces baby 'spiderettes'. Safe for pets!",
    poisonousToHumans: false,
    poisonousToPets: false,
    indoor: true,
    growthRate: "Fast",
    maintenance: "Low",
  },
  "rubber plant": {
    id: 7,
    commonName: "Rubber Plant",
    scientificName: "Ficus elastica",
    family: "Moraceae",
    watering: "average",
    wateringDescription: "Water when top 2 inches are dry. Every 1-2 weeks.",
    sunlight: ["part shade", "filtered light"],
    cycle: "Perennial",
    careLevel: "low",
    description: "Bold, glossy leaves make a statement. Easy to care for.",
    poisonousToHumans: true,
    poisonousToPets: true,
    indoor: true,
    growthRate: "Medium",
    maintenance: "Low",
  },
  "zz plant": {
    id: 8,
    commonName: "ZZ Plant",
    scientificName: "Zamioculcas zamiifolia",
    family: "Araceae",
    watering: "minimum",
    wateringDescription: "Very drought tolerant. Water every 2-3 weeks, allowing soil to dry completely.",
    sunlight: ["part shade", "filtered light", "full shade"],
    cycle: "Perennial",
    careLevel: "low",
    description: "Nearly indestructible. Tolerates low light and neglect extremely well.",
    poisonousToHumans: true,
    poisonousToPets: true,
    indoor: true,
    growthRate: "Slow",
    maintenance: "Low",
  },
  "aloe vera": {
    id: 9,
    commonName: "Aloe Vera",
    scientificName: "Aloe barbadensis miller",
    family: "Asphodelaceae",
    watering: "minimum",
    wateringDescription: "Allow soil to dry completely. Water every 2-3 weeks.",
    sunlight: ["full sun", "part sun"],
    cycle: "Perennial",
    careLevel: "low",
    description: "Medicinal succulent with soothing gel. Great for sunny windowsills.",
    poisonousToHumans: false,
    poisonousToPets: true,
    indoor: true,
    growthRate: "Slow",
    maintenance: "Low",
  },
  "boston fern": {
    id: 10,
    commonName: "Boston Fern",
    scientificName: "Nephrolepis xaltata",
    family: "Nephrolepidaceae",
    watering: "frequent",
    wateringDescription: "Keep soil consistently moist. Water when surface feels dry. Loves humidity.",
    sunlight: ["part shade", "filtered light"],
    cycle: "Perennial",
    careLevel: "medium",
    description: "Classic fern with feathery fronds. Needs consistent moisture and humidity.",
    poisonousToHumans: false,
    poisonousToPets: false,
    indoor: true,
    growthRate: "Medium",
    maintenance: "Medium",
  },
  "lion's mane": {
    id: 11,
    commonName: "Lion's Mane",
    scientificName: "Hericium erinaceus",
    family: "Hericiaceae",
    watering: "frequent",
    wateringDescription: "Requires high humidity. Mist 3-5 times daily. Do not let the substrate dry out.",
    sunlight: ["full shade", "filtered light"],
    cycle: "Fungal",
    careLevel: "medium",
    description: "Distinctive cascading white icicle-like spines. Known for cognitive benefits and gourmet flavor.",
    poisonousToHumans: false,
    poisonousToPets: false,
    indoor: true,
    growthRate: "Fast",
    maintenance: "Medium",
  },
  "cordyceps": {
    id: 12,
    commonName: "Cordyceps",
    scientificName: "Cordyceps militaris",
    family: "Cordycipitaceae",
    watering: "frequent",
    wateringDescription: "Maintain 90%+ humidity. Mist frequently. Keep in dark, cool conditions during colonization.",
    sunlight: ["full shade"],
    cycle: "Fungal",
    careLevel: "high",
    description: "High-value medicinal fungus. Requires precise temperature and humidity control.",
    poisonousToHumans: false,
    poisonousToPets: false,
    indoor: true,
    growthRate: "Medium",
    maintenance: "High",
  },
};

/**
 * Search for specimen species by name
 */
export function searchSpecimens(query: string): SpecimenSearchResult[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return [];
  
  const results: SpecimenSearchResult[] = [];
  
  for (const [key, specimen] of Object.entries(COMMON_SPECIMENS)) {
    if (
      key.includes(normalizedQuery) ||
      specimen.commonName.toLowerCase().includes(normalizedQuery) ||
      specimen.scientificName.toLowerCase().includes(normalizedQuery)
    ) {
      results.push({
        id: specimen.id,
        commonName: specimen.commonName,
        scientificName: specimen.scientificName,
      });
    }
  }
  
  return results;
}

/**
 * Get detailed care information for a specimen species
 */
export function getSpecimenCareInfo(speciesName: string): SpecimenSpeciesInfo | null {
  const normalizedName = speciesName.toLowerCase().trim();
  
  // Direct match
  if (COMMON_SPECIMENS[normalizedName]) {
    return COMMON_SPECIMENS[normalizedName];
  }
  
  // Search by common or scientific name
  for (const specimen of Object.values(COMMON_SPECIMENS)) {
    if (
      specimen.commonName.toLowerCase() === normalizedName ||
      specimen.scientificName.toLowerCase() === normalizedName
    ) {
      return specimen;
    }
  }
  
  return null;
}

/**
 * Get all available specimens in the database
 */
export function getAllSpecimens(): SpecimenSpeciesInfo[] {
  return Object.values(COMMON_SPECIMENS);
}
