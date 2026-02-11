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
    facultySchema,
    type FacultyFormValues,
} from "@/schemas/faculty.schema";

import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import {
    createFaculty,
    updateFaculty,
} from "@/api/faculty";

import type { Faculty } from "@/types/faculty";

interface AddFacultyFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "add" | "view" | "edit";
    faculty?: Faculty | null;
    onSuccess: () => void;
}

const AddFacultyForm = ({
    open,
    onOpenChange,
    mode,
    faculty,
    onSuccess,
}: AddFacultyFormProps) => {
    const { user } = useAuth();
    const orgId = user?.orgId;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid, isDirty },
        reset,
    } = useForm<FacultyFormValues>({
        resolver: zodResolver(facultySchema),
        mode: "onChange",
        defaultValues: {
            facultyName: "",
            facultyDepartment: "",
            facultyPhone: "",
            rfidCode: "",
        },
    });

    /* ================= RESET FORM ================= */

    useEffect(() => {
        if (mode === "edit" && faculty) {
            reset({
                facultyName: faculty.facultyName,
                facultyDepartment: faculty.facultyDepartment,
                facultyPhone: faculty.facultyPhone,
                rfidCode: faculty.rfidCode ?? "",
            });
        } else {
            reset({
                facultyName: "",
                facultyDepartment: "",
                facultyPhone: "",
                rfidCode: "",
            });
        }
    }, [faculty, mode, reset]);


    /* ================= SUBMIT ================= */

    const onSubmit = async (data: FacultyFormValues) => {
        if (!orgId) return;

        try {
            if (mode === "add") {
                await createFaculty(orgId, data);

                toast.success("Faculty added successfully");
            }

            if (mode === "edit" && faculty) {
                await updateFaculty({
                    facultyId: faculty.facultyId,
                    orgId,
                    ...data,
                });

                toast.success("Faculty updated successfully");
            }

            onSuccess();
            onOpenChange(false);
            reset();
        } catch (error: any) {
            toast.error(error?.message || "Operation failed");
        }
    };

    /* ================= RENDER ================= */

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-lg px-6 py-6"
            >
                <SheetHeader className="-ml-4">
                    <SheetTitle>
                        {mode === "add" && "Add Faculty"}
                        {mode === "view" && "View Faculty"}
                        {mode === "edit" && "Edit Faculty"}
                    </SheetTitle>
                    <SheetDescription>
                        {mode === "view"
                            ? "Faculty details"
                            : "Enter faculty details"}
                    </SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5 mt-2"
                >
                    {(
                        [
                            ["facultyName", "Faculty Name"],
                            ["facultyDepartment", "Department"],
                            ["facultyPhone", "Phone"],
                            ["rfidCode", "RFID Code"],
                        ] as const
                    ).map(([field, label]) => (
                        <div key={field} className="space-y-1.5">

                            <Label>{label} *</Label>

                            <Input
                                {...register(field)}
                                disabled={mode === "view"}
                                maxLength={field === "facultyPhone" ? 10 : undefined}
                                inputMode={field === "facultyPhone" ? "numeric" : undefined}
                                onInput={(e) => {
                                    if (field === "facultyPhone") {
                                        e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
                                    }
                                }}
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
                            disabled={
                                mode === "view" ||
                                !isValid ||
                                isSubmitting ||
                                (mode === "edit" && !isDirty)
                            }
                        >

                            {mode === "add" && "Add Faculty"}
                            {mode === "edit" && "Update Faculty"}
                            {mode === "view" && "Close"}
                        </Button>

                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
};

export default AddFacultyForm;
