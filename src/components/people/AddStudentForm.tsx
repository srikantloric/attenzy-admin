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
import { createStudent } from "@/api/students";

interface AddStudentFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const AddStudentForm = ({
    open,
    onOpenChange,
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

    const onSubmit = async (data: StudentFormValues) => {
        if (!orgId) {
            toast.error("Organization not found. Please login again.");
            return;
        }

        try {
            await createStudent(orgId, data);
            toast.success("Student added successfully");
            reset();
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || "Failed to add student");
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-lg px-6 py-6">
                <SheetHeader className="-ml-4">
                    <SheetTitle>Add Student</SheetTitle>
                    <SheetDescription>
                        Enter details to create a new student.
                    </SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5 mt-2"
                >
                    <div className="space-y-1.5">
                        <Label>Student Name *</Label>
                        <Input {...register("studentName")} />
                        {errors.studentName && (
                            <p className="text-sm text-destructive">
                                {errors.studentName.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Class *</Label>
                        <Input {...register("studentClass")} />
                        {errors.studentClass && (
                            <p className="text-sm text-destructive">
                                {errors.studentClass.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Section *</Label>
                        <Input {...register("studentSection")} />
                        {errors.studentSection && (
                            <p className="text-sm text-destructive">
                                {errors.studentSection.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Phone *</Label>
                        <Input
                            {...register("studentPhone")}
                            inputMode="numeric"
                            maxLength={10}
                        />
                        {errors.studentPhone && (
                            <p className="text-sm text-destructive">
                                {errors.studentPhone.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>RFID Code *</Label>
                        <Input {...register("rfidCode")} />
                        {errors.rfidCode && (
                            <p className="text-sm text-destructive">
                                {errors.rfidCode.message}
                            </p>
                        )}
                    </div>

                    <Separator />

                    <div className="flex justify-end gap-3 pt-2">
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
                            disabled={!isValid || isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Add Student"}
                        </Button>


                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
};

export default AddStudentForm;
