"use server";

import { marketplace } from "@/lib/services/marketplace";
import type { SpecimenRow } from "@/app/actions/types";

export interface SwapListing {
  id: string;
  userId: string;
  username: string;
  plantName: string;
  species: string;
  description: string;
  imageUrl: string;
  location: string;
  type: "Cutting" | "Seed" | "Starter";
  status: "Available" | "Pending" | "Swapped";
  createdAt: string;
}

const mockSwaps: SwapListing[] = [
  {
    id: "swap-1",
    userId: "user-1",
    username: "PlantMama_92",
    plantName: "Pilea Peperomioides",
    species: "Pilea",
    description: "Well-rooted cutting from a healthy mother plant. Looking for exotic succulents!",
    imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=400&h=400&auto=format&fit=crop",
    location: "Brooklyn, NY",
    type: "Cutting",
    status: "Available",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "swap-2",
    userId: "user-2",
    username: "GreenThumb_Leo",
    plantName: "Variegated Pothos",
    species: "Epipremnum aureum",
    description: "Fresh cuttings with 2-3 nodes. High variegation. Open to any trades!",
    imageUrl: "https://images.unsplash.com/photo-1597055181300-e3633a207519?q=80&w=400&h=400&auto=format&fit=crop",
    location: "Austin, TX",
    type: "Cutting",
    status: "Available",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "swap-3",
    userId: "user-3",
    username: "RarePlantHunter",
    plantName: "Alocasia Polly",
    species: "Alocasia",
    description: "Starter plant (4 inches). Healthy roots. Swapping for cool Hoyas.",
    imageUrl: "https://images.unsplash.com/photo-1612360420286-99689e71ecaa?q=80&w=400&h=400&auto=format&fit=crop",
    location: "Seattle, WA",
    type: "Starter",
    status: "Pending",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  }
];

export async function getSwapListings(): Promise<{ success: boolean; data: SwapListing[] }> {
  // In a real app, this would query a 'swaps' table.
  return { success: true, data: mockSwaps };
}
export async function listSpecimenForSale(specimenId: string, price: number): Promise<{ success: boolean; message?: string }> {
  try {
    // In a real app this would call a backend endpoint; here we simulate via marketplace service
    // marketplace.listSpecimen expects a full SpecimenRow; we provide minimal stub
    const stubSpecimen = { id: specimenId } as unknown as SpecimenRow;
    await marketplace.listSpecimen(stubSpecimen, price);
    return { success: true };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Failed to list specimen' };
  }
}
