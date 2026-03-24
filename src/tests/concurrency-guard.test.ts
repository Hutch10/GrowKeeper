import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkMutationGuard, __injectTestClients } from "@/lib/mutation-utility";

// Global mocks
const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
};

const mockRatelimit = {
  limit: vi.fn(),
};

describe("Atomic Concurrency Guard", () => {
  const userId = "tester-50-alpha";
  const actionName = "addSpecimen";
  const payload = { nickname: "Obsidian Bloom" };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.UPSTASH_REDIS_REST_URL = "https://mock-redis.upstash.io";
    __injectTestClients(mockRedis, mockRatelimit);
    
    // Reset Ratelimit to always succeed by default
    mockRatelimit.limit.mockResolvedValue({ success: true });
  });

  it("should allow exactly one request to win in a high-concurrency burst (50 requests)", async () => {
    // Simulate Redis SET NX: 
    // First call succeeds, all subsequent calls return null (failed to set)
    let callCount = 0;
    mockRedis.set.mockImplementation(() => {
      if (callCount === 0) {
        callCount++;
        return Promise.resolve("OK");
      }
      return Promise.resolve(null);
    });

    // Fire 50 identical requests concurrently
    const requests = Array.from({ length: 50 }).map(() => 
      checkMutationGuard(userId, actionName, payload)
    );

    const results = await Promise.all(requests);

    const successes = results.filter(r => r.allowed === true);
    const failures = results.filter(r => r.allowed === false);

    expect(successes.length).toBe(1);
    expect(failures.length).toBe(49);
    expect(failures[0].error).toContain("duplicate request detected");
  });

  it("should allow non-identical payloads even within the same throttle window if rate limit permits", async () => {
    mockRedis.set.mockResolvedValue("OK");

    const res1 = await checkMutationGuard(userId, actionName, { data: "A" });
    const res2 = await checkMutationGuard(userId, actionName, { data: "B" });

    expect(res1.allowed).toBe(true);
    expect(res2.allowed).toBe(true);
    expect(mockRedis.set).toHaveBeenCalledTimes(2);
  });

  it("should enforce rate limiting independently of idempotency", async () => {
    mockRatelimit.limit.mockResolvedValue({ success: false });

    const result = await checkMutationGuard(userId, actionName, payload);
    
    expect(result.allowed).toBe(false);
    expect(result.error).toContain("System stabilizing");
    expect(mockRedis.set).not.toHaveBeenCalled(); // Blocked by rate limit first
  });

  it("should handle Redis downtime gracefully (Fail-over to Allow)", async () => {
    mockRedis.set.mockRejectedValue(new Error("Redis Disconnected"));

    const result = await checkMutationGuard(userId, actionName, payload);
    
    expect(result.allowed).toBe(true);
  });
});
