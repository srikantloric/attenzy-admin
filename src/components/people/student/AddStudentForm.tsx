import { useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    studentSchema,
    type StudentFormValues,
} from "@/schemas/student.schema";

import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { createStudent, updateStudent } from "@/api/students";
import type { Student } from "@/types/student";

interface AddStudentFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "add" | "view" | "edit";
    student?: Student | null;
    onSuccess: () => void;
}

const AddStudentForm = ({
    open,
    onOpenChange,
    mode,
    student,
    onSuccess,
}: AddStudentFormProps) => {
    const { user } = useAuth();
    const orgId = user?.orgId;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
        reset,
    } = useForm<StudentFormValues>({
        resolver: zodResolver(studentSchema),
        mode: "onChange",
        defaultValues: {
            studentName: "",
            studentClass: "",
            studentSection: "",
            studentPhone: "",
            rfidCode: "",
        },
    });

    useEffect(() => {
        if (student) {
            reset({
                studentName: student.studentName,
                studentClass: student.studentClass,
                studentSection: student.studentSection,
                studentPhone: student.studentPhone,
                rfidCode: student.rfidCode ?? "",
            });
        } else {
            reset();
        }
    }, [student, reset]);

    const onSubmit = async (data: StudentFormValues) => {
        if (!orgId) return;

        try {
            if (mode === "add") {
                await createStudent(orgId, data);
                toast.success("Student added successfully");
            }

            if (mode === "edit" && student) {
                await updateStudent(student.studentId, orgId, data);
                toast.success("Student updated successfully");
            }

            onSuccess();
            onOpenChange(false);
            reset();
        } catch (error: any) {
            toast.error(error?.message || "Operation failed");
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-lg px-6 py-6">
                <SheetHeader className="-ml-4">
                    <SheetTitle>
                        {mode === "add" && "Add Student"}
                        {mode === "view" && "View Student"}
                        {mode === "edit" && "Edit Student"}
                    </SheetTitle>
                    <SheetDescription>
                        {mode === "view"
                            ? "Student details"
                            : "Enter student details"}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
                    {(
                        [
                            ["studentName", "Student Name"],
                            ["studentClass", "Class"],
                            ["studentSection", "Section"],
                            ["studentPhone", "Phone"],
                            ["rfidCode", "RFID Code"],
                        ] as const
                    ).map(([field, label]) => (
                        <div key={field} className="space-y-1.5">
                            <Label>{label} *</Label>
                            <Input
                                {...register(field)}
                                disabled={mode === "view"}
                            />
                            {errors[field] && (
                                <p className="text-sm text-destructive">
                                    {errors[field]?.message}
                                </p>
                            )}
                        </div>
                    ))}

                    <Separator />

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            className="bg-primary"
                            type="submit"
                            disabled={mode === "view" || !isValid || isSubmitting}
                        >
                            {mode === "add" && "Add Student"}
                            {mode === "edit" && "Update Student"}
                            {mode === "view" && "Close"}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
};

export default AddStudentForm;
