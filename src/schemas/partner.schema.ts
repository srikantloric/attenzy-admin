import { z } from "zod"

export const partnerSchema = z.object({
  partnerName: z
    .string()
    .min(2, "Partner name must be at least 2 characters"),

  partnerEmail: z
    .string()
    .email("Enter a valid email address"),

  partnerCompany: z
    .string()
    .min(1, "Company name is required"),

  partnerPhone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),

  partnerAddress: z
    .string()
    .min(3, "Address is required")
})

export type PartnerFormValues = z.infer<typeof partnerSchema>
