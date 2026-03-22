import { addSpecimenSchema, updateSpecimenSchema } from "./specimen";

describe("addSpecimenSchema", () => {
  it("should validate a valid specimen", () => {
    const result = addSpecimenSchema.safeParse({
      nickname: "My Specimen",
      species_name: "Monstera Deliciosa",
      notes: "Needs low light",
    });
    expect(result.success).toBe(true);
  });

  it("should require a nickname", () => {
    const result = addSpecimenSchema.safeParse({
      species_name: "Monstera Deliciosa",
    });
    expect(result.success).toBe(false);
  });

  it("should allow optional fields", () => {
    const result = addSpecimenSchema.safeParse({
      nickname: "My Specimen",
    });
    expect(result.success).toBe(true);
  });

  it("should trim whitespace from nickname", () => {
    const result = addSpecimenSchema.safeParse({
      nickname: "  My Specimen  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nickname).toBe("My Specimen");
    }
  });

  it("should reject long nicknames", () => {
    const result = addSpecimenSchema.safeParse({
      nickname: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateSpecimenSchema", () => {
  it("should validate a valid update", () => {
    const result = updateSpecimenSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      nickname: "My Specimen",
    });
    expect(result.success).toBe(true);
  });

  it("should require a valid UUID for id", () => {
    const result = updateSpecimenSchema.safeParse({
      id: "not-a-uuid",
      nickname: "My Specimen",
    });
    expect(result.success).toBe(false);
  });
});
