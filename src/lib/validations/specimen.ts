import { z } from "zod";

export const addSpecimenSchema = z.object({
  nickname: z
    .string()
    .min(1, "Nickname is required")
    .max(100, "Nickname must be less than 100 characters")
    .trim(),
  species_name: z
    .string()
    .max(150, "Species name must be less than 150 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .trim()
    .optional()
    .or(z.literal("")),
});

export const updateSpecimenSchema = addSpecimenSchema.extend({
  id: z.string().uuid("Invalid specimen ID"),
});

export type AddSpecimenInput = z.infer<typeof addSpecimenSchema>;
export type UpdateSpecimenInput = z.infer<typeof updateSpecimenSchema>;
