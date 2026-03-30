import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createHash } from "node:crypto";

/**
 * Distributed Mutation Guard Utility (Atomic Production Grade)
 *
 * Uses Upstash Redis to ensure ATOMIC idempotency and rate-limiting 
 * across multiple serverless instances.
 */

let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

/**
 * Internal for testing. Allows injection of mocks.
 */
export function __injectTestClients(r: unknown, rl: unknown) {
  redis = r as Redis;
  ratelimit = rl as Ratelimit;
}

function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || "",
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    });
  }
  return redis;
}

function getRatelimit() {
  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(1, "2 s"),
      analytics: true,
      prefix: "@growkeeper/ratelimit",
    });
  }
  return ratelimit;
}

/**
 * Checks if a mutation is allowed based on ATOMIC idempotency and rate limiting.
 */
export async function checkMutationGuard(
  userId: string,
  actionName: string,
  payload: unknown
): Promise<{ allowed: boolean; error?: string }> {
  // Graceful Fallback check
  if (!process.env.UPSTASH_REDIS_REST_URL && process.env.NODE_ENV !== "test") {
    console.warn("[MUTATION_GUARD_WARNING] Redis URL missing. Falling back to permissive mode.");
    return { allowed: true };
  }

  const keyBase = `${userId}:${actionName}`;
  const throttleKey = `@growkeeper/throttle:${keyBase}`;

  try {
    const client = getRedis();
    const limiter = getRatelimit();

    // 1. Rate Limiting Check (Atomic Lua)
    const { success: throttleSuccess } = await limiter.limit(throttleKey);
    if (!throttleSuccess) {
      return { 
        allowed: false, 
        error: "System stabilizing. Please wait before retrying the transmission." 
      };
    }

    // 2. Payload Hashing
    const payloadStr = JSON.stringify(payload);
    const payloadHash = createHash("sha256").update(payloadStr).digest("hex");
    
    // 3. ATOMIC Idempotency Locking
    // We use a separate key that includes the payload hash for strict duplicate detection.
    // The lock key is userId:actionName:payloadHash
    const lockKey = `@growkeeper/idempotency:${keyBase}:${payloadHash}`;
    
    // SET NX (Not Exists) with 60s expiration
    // Upstash Redis returns "OK" on success, null if key exists.
    const lockAcquired = await client.set(lockKey, "LOCKED", { nx: true, ex: 60 });

    if (lockAcquired !== "OK") {
       return { 
        allowed: false, 
        error: "Mutation anchored. Identical duplicate request detected in registry." 
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("[MUTATION_GUARD_REDIS_ERROR]", error);
    return { allowed: true };
  }
}
