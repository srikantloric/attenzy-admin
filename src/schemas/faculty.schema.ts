import { z } from "zod";

export const facultySchema = z.object({
    facultyName: z.string().min(2, "Name is required"),

    facultyDepartment: z.string().min(2, "Department is required"),

    facultyPhone: z
        .string()
        .regex(/^[0-9]{10}$/, "Phone must be 10 digits"),

    rfidCode: z.string().min(3, "RFID is required"),
});

export type FacultyFormValues = z.infer<typeof facultySchema>;
