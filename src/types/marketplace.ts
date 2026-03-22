export type ListingStatus = "available" | "escrow" | "sold" | "withdrawn";
export type EscrowStatus = "pending" | "funded" | "released" | "refunded";

export interface Listing {
  id: string;
  specimenId: string;
  sellerId: string;
  price: number;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Escrow {
  id: string;
  listingId: string;
  buyerId: string;
  amount: number;
  status: EscrowStatus;
  txHash?: string;
  network?: string;
  createdAt: string;
  expiresAt: string;
}
