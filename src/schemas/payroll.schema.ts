import { z } from "zod"

export const payrollPaymentDetailsSchema = z
  .object({
    userType: z.enum(["STAFF", "FACULTY"]),
    userId: z.string().min(1, "Employee is required"),
    userName: z.string().min(1, "Employee name is required"),
    department: z.string().min(1, "Department is required"),
    paymentMode: z.enum(["BANK", "UPI", "BANK_AND_UPI"]),
    accountHolderName: z.string().optional().default(""),
    accountNumber: z.string().optional().default(""),
    ifscCode: z
      .string()
      .optional()
      .default("")
      .transform((value) => value.toUpperCase().trim()),
    bankName: z.string().optional().default(""),
    branchName: z.string().optional().default(""),
    upiId: z.string().optional().default(""),
    isActive: z.boolean().default(true),
  })
  .superRefine((value, context) => {
    const requiresBank = value.paymentMode === "BANK" || value.paymentMode === "BANK_AND_UPI"
    const requiresUpi = value.paymentMode === "UPI" || value.paymentMode === "BANK_AND_UPI"

    if (requiresBank) {
      if (!value.accountHolderName.trim()) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ["accountHolderName"], message: "Account holder name is required" })
      }

      if (!/^\d{9,18}$/.test(value.accountNumber ?? "")) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ["accountNumber"], message: "Account number must be 9 to 18 digits" })
      }

      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test((value.ifscCode ?? "").toUpperCase())) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ["ifscCode"], message: "Invalid IFSC code" })
      }

      if (!value.bankName.trim()) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ["bankName"], message: "Bank name is required" })
      }
    }

    if (requiresUpi) {
      if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test((value.upiId ?? "").trim())) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ["upiId"], message: "Invalid UPI ID" })
      }
    }
  })

export type PayrollPaymentDetailsFormValues = z.infer<typeof payrollPaymentDetailsSchema>
