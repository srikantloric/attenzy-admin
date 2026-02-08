import { z } from "zod"

export const organizationSchema = z.object({
  orgName: z
    .string()
    .min(3, "Organization name must be at least 3 characters"),

  orgEmail: z
    .string()
    .email("Enter a valid organization email"),

  orgPhone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),

  orgAddress: z
    .string()
    .min(5, "Address is required"),
})

export type OrganizationFormValues = z.infer<typeof organizationSchema>
