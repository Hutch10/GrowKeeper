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

describe("Distributed Mutation Guard", () => {
  const userId = "test-user-123";
  const actionName = "addSpecimen";
  const payload = { nickname: "Test Plant" };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.UPSTASH_REDIS_REST_URL = "https://mock-redis.upstash.io";
    
    // Inject mocks into the utility
    __injectTestClients(mockRedis, mockRatelimit);
    
    // Defaults
    mockRatelimit.limit.mockResolvedValue({ success: true });
    mockRedis.get.mockResolvedValue(null);
  });

  it("should allow a valid, first-time mutation", async () => {
    const result = await checkMutationGuard(userId, actionName, payload);
    expect(result.allowed).toBe(true);
    expect(mockRedis.set).toHaveBeenCalled();
  });

  it("should block a duplicate payload within the 60s window (Idempotency)", async () => {
    const payloadStr = JSON.stringify(payload);
    const { createHash } = await import("node:crypto");
    const payloadHash = createHash("sha256").update(payloadStr).digest("hex");
    
    mockRedis.get.mockResolvedValue(payloadHash);

    const result = await checkMutationGuard(userId, actionName, payload);
    
    expect(result.allowed).toBe(false);
    expect(result.error).toContain("duplicate request detected");
  });

  it("should block a request when rate limit is exceeded (Throttling)", async () => {
    mockRatelimit.limit.mockResolvedValue({ success: false });

    const result = await checkMutationGuard(userId, actionName, payload);
    
    expect(result.allowed).toBe(false);
    expect(result.error).toContain("System stabilizing");
  });

  it("should fail gracefully and allow mutation if Redis is unreachable", async () => {
    mockRedis.get.mockRejectedValue(new Error("Connection Timeout"));

    const result = await checkMutationGuard(userId, actionName, payload);
    
    expect(result.allowed).toBe(true); // Fail-safe fallback
  });
});
