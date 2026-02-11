import { z } from "zod";

export const staffSchema = z.object({
  staffName: z.string().min(2, "Name is required"),

  staffDesignation: z
    .string()
    .min(2, "Designation is required"),

  staffPhone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone must be 10 digits"),

  rfidCode: z.string().optional(),
});

export type StaffFormValues = z.infer<typeof staffSchema>;
