import type { Escrow } from '@/types/marketplace';

/**
 * Biological Provenance Service
 * Implements a cryptographic hash-chain for specimen health and lineage certification.
 */

export interface ProvenanceBlock {
  specimenId: string;
  timestamp: number;
  event: string;
  data: Record<string, unknown>;
  previousHash: string;
  hash: string;
  agentSignature?: string;
}

class ProvenanceService {
  private worker: Worker | null = null;
  private pendingHashes = new Map<string, (hash: string) => void>();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.worker = new Worker(new URL('../workers/provenance-worker.ts', import.meta.url));
        this.worker.onmessage = (e) => {
          const { id, hash, error } = e.data;
          const resolve = this.pendingHashes.get(id);
          if (resolve) {
            this.pendingHashes.delete(id);
            if (error) {
              console.error('[ProvenanceWorker] Hashing Error:', error);
            } else {
              resolve(hash);
            }
          }
        };
      } catch (err) {
        console.warn('[Provenance] Worker initialization failed, failing back to main thread.', err);
      }
    }
  }

  /**
   * Calculates a SHA-256 hash. Uses Worker if available, else main thread.
   */
  private async calculateHash(block: Omit<ProvenanceBlock, 'hash'>): Promise<string> {
    if (this.worker) {
      const id = Math.random().toString(36).substring(7);
      return new Promise((resolve) => {
        this.pendingHashes.set(id, resolve);
        this.worker?.postMessage({ id, block });
      });
    }

    // Fallback: Main Thread Hashing
    const msgBuffer = new TextEncoder().encode(JSON.stringify(block));
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Creates an immutable certification block.
   */
  async certifyEvent(
    specimenId: string, 
    event: string, 
    data: Record<string, unknown>, 
    previousHash = '0'.repeat(64)
  ): Promise<ProvenanceBlock> {
    const blockBase: Omit<ProvenanceBlock, 'hash'> = {
      specimenId,
      timestamp: Date.now(),
      event,
      data,
      previousHash,
      agentSignature: 'GK-AUTH-v7.1-' + Math.random().toString(36).substring(7).toUpperCase(),
    };

    const hash = await this.calculateHash(blockBase);
    return { ...blockBase, hash };
  }

  /**
   * Verifies the integrity of a provenance chain using the worker for bulk processing.
   */
  async verifyChain(blocks: ProvenanceBlock[]): Promise<boolean> {
    if (blocks.length === 0) return true;

    if (this.worker) {
      const id = 'verify-' + Math.random().toString(36).substring(7);
      return new Promise((resolve) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const verifyHandler = (e: MessageEvent) => {
          if (e.data.id === id) {
            this.worker?.removeEventListener('message', verifyHandler);
            resolve(e.data.isValid);
          }
        };
        this.worker?.addEventListener('message', verifyHandler);
        this.worker?.postMessage({ id, type: 'verify-chain', blocks });
      });
    }

    // Fallback: Main Thread Verification
    for (let i = 0; i < blocks.length; i++) {
      const current = blocks[i];
      const { hash, ...blockWithoutHash } = current;
      const recomputedHash = await this.calculateHash(blockWithoutHash);
      if (hash !== recomputedHash) return false;

      if (i > 0 && current.previousHash !== blocks[i - 1].hash) {
        return false;
      }
    }
    return true;
  }

  /**
   * Mocks a Layer-2 (L2) blockchain minting operation for specimen provenance.
   * In a production environment, this would interface with ethers.js or viem.
   */
  async mintOnL2(certification: ProvenanceBlock): Promise<{ txHash: string; network: string }> {
    console.log(`[Provenance] Initiating L2 Mint for ${certification.specimenId}...`);
    
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      network: 'Arbitrum One (Tactical Node)'
    };
  }

  /**
   * Initiates a simulated L2 escrow for a marketplace transaction.
   */
  async initiateEscrow(listingId: string, buyerId: string, amount: number): Promise<Escrow> {
    console.log(`[L2-Escrow] Initiating escrow for listing ${listingId}...`);
    
    // Simulate smart contract interaction
    await new Promise(resolve => setTimeout(resolve, 1000));

    const escrow: Escrow = {
      id: `escrow_${Math.random().toString(36).substring(7)}`,
      listingId,
      buyerId,
      amount,
      status: 'funded',
      txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      network: 'Arbitrum One (Tactical Node)',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24h expiry
    };

    return escrow;
  }

  /**
   * Finalizes a specimen transfer on the simulated L2.
   */
  async finalizeTransfer(escrowId: string): Promise<{ success: boolean; txHash: string }> {
    console.log(`[L2-Escrow] Finalizing transfer for escrow ${escrowId}...`);
    
    await new Promise(resolve => setTimeout(resolve, 1200));

    return {
      success: true,
      txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };
  }
}

export const provenance = new ProvenanceService();
