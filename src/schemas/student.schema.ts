import { z } from "zod";

export const studentSchema = z.object({
    studentName: z.string().min(2, "Student name is required"),
    studentClass: z.string().min(1, "Class is required"),
    studentSection: z.string().min(1, "Section is required"),
    studentPhone: z
        .string()
        .regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
    rfidCode: z.string().min(1, "RFID code is required"),
});

export type StudentFormValues = z.infer<typeof studentSchema>;
