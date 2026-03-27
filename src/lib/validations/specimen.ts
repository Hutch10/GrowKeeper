import { z } from "zod";

const baseSpecimenSchema = z.object({
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
    .nullable()
    .or(z.literal("")),
  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  hardware_attestation_statement: z.string().optional().nullable(),
  last_vital_signature: z.string().optional().nullable(),
  compliance_status: z.string().optional().nullable(),
});

const plantSchema = baseSpecimenSchema.extend({
  kingdom: z.literal("Plantae"),
  light: z.string().max(100).optional().nullable(),
  watering: z.string().max(100).optional().nullable(),
  fertilizer: z.string().max(100).optional().nullable(),
});

const fungalSchema = baseSpecimenSchema.extend({
  kingdom: z.literal("Fungi"),
  substrate: z.string().max(100).optional().nullable(),
  misting_schedule: z.string().max(100).optional().nullable(),
  fertilizer: z.string().max(100).optional().nullable(),
});

const animaliaSchema = baseSpecimenSchema.extend({
  kingdom: z.literal("Animalia"),
  heart_rate: z.number().int().optional().nullable(),
  activity_level: z.number().int().optional().nullable(),
  dietary_notes: z.string().max(1000).optional().nullable(),
});

export const addSpecimenSchema = z.discriminatedUnion("kingdom", [
  plantSchema,
  fungalSchema,
  animaliaSchema,
  baseSpecimenSchema.extend({ kingdom: z.literal("Other") }),
]);

export const updateSpecimenSchema = z.intersection(
  z.object({ id: z.string().uuid("Invalid specimen ID").or(z.string().startsWith("guest-specimen-")) }),
  addSpecimenSchema
);

export type AddSpecimenInput = z.infer<typeof addSpecimenSchema>;
export type UpdateSpecimenInput = z.infer<typeof updateSpecimenSchema>;

