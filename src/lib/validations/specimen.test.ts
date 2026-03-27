import { describe, it, expect } from "vitest";
import { addSpecimenSchema, updateSpecimenSchema } from "./specimen";


describe("addSpecimenSchema", () => {
  describe("Plantae", () => {
    it("should validate a valid plant", () => {
      const result = addSpecimenSchema.safeParse({
        kingdom: "Plantae",
        nickname: "Monstera",
        species_name: "Monstera Deliciosa",
        light: "Indirect",
        watering: "Weekly",
      });
      expect(result.success).toBe(true);
    });

    it("should require a nickname", () => {
      const result = addSpecimenSchema.safeParse({
        kingdom: "Plantae",
        species_name: "Monstera Deliciosa",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Fungi", () => {
    it("should validate a valid fungus", () => {
      const result = addSpecimenSchema.safeParse({
        kingdom: "Fungi",
        nickname: "Oyster Mushroom",
        substrate: "Straw",
        misting_schedule: "Twice daily",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Animalia", () => {
    it("should validate a valid animal", () => {
      const result = addSpecimenSchema.safeParse({
        kingdom: "Animalia",
        nickname: "Hamster",
        heart_rate: 400,
        activity_level: 8,
      });
      expect(result.success).toBe(true);
    });

    it("should reject non-integer heart rate", () => {
      const result = addSpecimenSchema.safeParse({
        kingdom: "Animalia",
        nickname: "Hamster",
        heart_rate: 400.5,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Common Fields", () => {
    it("should validate hardware attestation", () => {
      const result = addSpecimenSchema.safeParse({
        kingdom: "Other",
        nickname: "Iridium Sensor",
        hardware_attestation_statement: "SIG:12345",
      });
      expect(result.success).toBe(true);
    });

    it("should trim strings", () => {
      const result = addSpecimenSchema.safeParse({
        kingdom: "Other",
        nickname: "  Trim Me  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nickname).toBe("Trim Me");
      }
    });
  });
});

describe("updateSpecimenSchema", () => {
  it("should validate a valid update", () => {
    const result = updateSpecimenSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      kingdom: "Plantae",
      nickname: "Updated Name",
    });
    expect(result.success).toBe(true);
  });

  it("should validate guest specimen IDs", () => {
    const result = updateSpecimenSchema.safeParse({
      id: "guest-specimen-12345",
      kingdom: "Fungi",
      nickname: "Guest Fungus",
    });
    expect(result.success).toBe(true);
  });

  it("should require a valid ID format", () => {
    const result = updateSpecimenSchema.safeParse({
      id: "invalid-id",
      kingdom: "Animalia",
      nickname: "Invalid",
    });
    expect(result.success).toBe(false);
  });
});

