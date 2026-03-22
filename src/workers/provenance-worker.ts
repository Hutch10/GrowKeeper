/**
 * Provenance Worker
 * Handles SHA-256 hashing in a background thread to keep the main UI thread responsive.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hashBlock = async (block: any) => {
  const msgBuffer = new TextEncoder().encode(JSON.stringify(block));
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

self.onmessage = async (e: MessageEvent) => {
  const { id, type, block, blocks } = e.data;
  
  try {
    if (type === 'verify-chain') {
      if (!blocks || blocks.length === 0) {
        self.postMessage({ id, isValid: true });
        return;
      }

      for (let i = 0; i < blocks.length; i++) {
        const current = blocks[i];
        const { hash, ...blockWithoutHash } = current;
        const recomputedHash = await hashBlock(blockWithoutHash);
        
        if (hash !== recomputedHash) {
          self.postMessage({ id, isValid: false, reason: `Hash mismatch at index ${i}` });
          return;
        }

        if (i > 0 && current.previousHash !== blocks[i - 1].hash) {
          self.postMessage({ id, isValid: false, reason: `Chain break at index ${i}` });
          return;
        }
      }
      self.postMessage({ id, isValid: true });
    } else {
      // Default: Single Hash
      const hash = await hashBlock(block);
      self.postMessage({ id, hash });
    }
  } catch (error) {
    self.postMessage({ id, error: error instanceof Error ? error.message : 'Unknown worker error' });
  }
};
