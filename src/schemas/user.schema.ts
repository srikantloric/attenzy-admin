import { z } from "zod";

export const userSchema = z.discriminatedUnion("userType", [

  // ================= STUDENT =================
  z.object({
    userType: z.literal("STUDENT"),
    name: z.string().min(2, "Name is required"),
    phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
    email: z.string().email("Invalid email"),
    rfidCode: z.string().min(1, "RFID required"),

    externalId: z.string().optional(),
    profilePhoto: z.string().optional(),

    profile: z.object({
      class: z.string().min(1, "Class is required"),
      section: z.string().min(1, "Section is required"),
      rollNumber: z.string().min(1, "Roll number is required"),
    }),
  }),

  // ================= STAFF =================
  z.object({
    userType: z.literal("STAFF"),
    name: z.string().min(2, "Name is required"),
    phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
    email: z.string().email("Invalid email"),
    rfidCode: z.string().min(1, "RFID required"),

    externalId: z.string().optional(),
    profilePhoto: z.string().optional(),

    profile: z.object({
      designation: z.string().min(1, "Designation is required"),
      department: z.string().min(1, "Department is required"),
    }),
  }),

  // ================= FACULTY =================
  z.object({
    userType: z.literal("FACULTY"),
    name: z.string().min(2, "Name is required"),
    phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
    email: z.string().email("Invalid email"),
    rfidCode: z.string().min(1, "RFID required"),

    externalId: z.string().optional(),
    profilePhoto: z.string().optional(),

    profile: z.object({
      department: z.string().min(1, "Department is required"),
      subjects: z.string().min(1, "Subjects required"),
    }),
  }),
]);

export type UserFormValues = z.infer<typeof userSchema>;
