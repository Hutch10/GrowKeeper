import { describe, it, expect } from "vitest";
import { checkLegalStatus } from "@/lib/geofencing";

describe("Geofencing Logic", () => {
  it("should return 'danger' for coordinates inside Restricted Private Property", () => {
    // Inside PRIVATE_LAND but outside EPZ_SENSITIVE
    const result = checkLegalStatus(-115.01, 36.01);
    expect(result.status).toBe("danger");
    expect(result.message).toContain("Private Property");
  });

  it("should return 'warning' for coordinates inside BLM Land", () => {
    // Inside BLM_LAND polygon from geofencing.ts
    const result = checkLegalStatus(-115.15, 36.15);
    expect(result.status).toBe("warning");
    expect(result.message).toContain("BLM LAND");
  });

  it("should return 'danger' for coordinates inside Ecological Protection Zone", () => {
    // Inside EPZ_SENSITIVE polygon from geofencing.ts
    const result = checkLegalStatus(-115.06, 36.06);
    expect(result.status).toBe("danger");
    expect(result.message).toContain("EPZ DETECTED");
  });

  it("should return 'safe' for coordinates outside all restricted zones", () => {
    // Far away from any defined polygons
    const result = checkLegalStatus(-116.0, 37.0);
    expect(result.status).toBe("safe");
    expect(result.message).toContain("PUBLIC ACCESS");
  });
});
