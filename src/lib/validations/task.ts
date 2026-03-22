import { z } from "zod";

export const taskTypeSchema = z.enum([
  "watered",
  "fertilized",
  "prune",
  "repot",
  "inspect",
]);

export const addTaskSchema = z.object({
  specimen_id: z.string().uuid("Invalid specimen ID"),
  task_type: taskTypeSchema,
  due_date: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: "Invalid date format" }
    ),
});

export const careEventTypeSchema = z.enum([
  "watered",
  "fertilized",
  "pruned",
  "repotted",
]);

export const addCareEventSchema = z.object({
  specimen_id: z.string().uuid("Invalid specimen ID"),
  event_type: careEventTypeSchema,
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type AddTaskInput = z.infer<typeof addTaskSchema>;
export type AddCareEventInput = z.infer<typeof addCareEventSchema>;
