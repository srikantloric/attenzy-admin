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

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    userSchema,
    type UserFormValues,
} from "@/schemas/user.schema";

import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { createUser, updateUser } from "@/api/users";
import type { UserType } from "@/types/users";

interface AddUserFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "add" | "edit";
    user?: any | null;
    onSuccess: () => void;
    defaultUserType?: UserType;
}

const AddUserForm = ({
    open,
    onOpenChange,
    mode,
    user,
    onSuccess,
    defaultUserType = "STUDENT",
}: AddUserFormProps) => {
    const { user: authUser } = useAuth();
    const orgId = authUser?.orgId;

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting, isValid, isDirty },
        reset,
    } = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        mode: "onChange",
        defaultValues: {
            userType: defaultUserType || "STUDENT",
        },
    });


    const selectedType = watch("userType");

    useEffect(() => {
        if (mode === "edit" && user) {
            reset(user);
            return;
        }

        if (mode === "add") {
            reset();
            setValue("userType", defaultUserType);
        }
    }, [user, mode, defaultUserType, reset, setValue]);


    const onSubmit = async (data: UserFormValues) => {
        if (!orgId) return;

        try {
            if (mode === "add") {
                await createUser(orgId, data);
                toast.success("User added successfully");
            }

            if (mode === "edit" && user) {
                await updateUser(orgId, user.userId, data);
                toast.success("User updated successfully");
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
                        {mode === "add" ? "Add User" : "Edit User"}
                    </SheetTitle>
                    <SheetDescription>
                        Enter user details
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">

                    {/* User Type */}
                    <div className="space-y-1.5">
                        <Label>User Type *</Label>
                        <Select
                            value={selectedType}
                            onValueChange={(val) =>
                                setValue("userType", val as any)
                            }
                        >

                            <SelectTrigger>
                                <SelectValue placeholder="Select user type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="STUDENT">Student</SelectItem>
                                <SelectItem value="STAFF">Staff</SelectItem>
                                <SelectItem value="FACULTY">Faculty</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Common Fields */}
                    <div>
                        <Label className="mb-1">Name *</Label>
                        <Input {...register("name")} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>

                    <div>
                        <Label className="mb-1">Phone *</Label>
                        <Input {...register("phone")} maxLength={10} />
                        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                    </div>

                    <div>
                        <Label className="mb-1">Email *</Label>
                        <Input {...register("email")} />
                        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>

                    <div>
                        <Label className="mb-1">RFID *</Label>
                        <Input {...register("rfidCode")} />
                    </div>

                    <Separator />

                    {/* Dynamic Profile */}

                    {selectedType === "STUDENT" && (
                        <>
                            <Input placeholder="Class" {...register("profile.class")} />
                            <Input placeholder="Section" {...register("profile.section")} />
                            <Input placeholder="Roll Number" {...register("profile.rollNumber")} />
                        </>
                    )}

                    {selectedType === "STAFF" && (
                        <>
                            <Input placeholder="Designation" {...register("profile.designation")} />
                            <Input placeholder="Department" {...register("profile.department")} />
                        </>
                    )}

                    {selectedType === "FACULTY" && (
                        <>
                            <Input placeholder="Department" {...register("profile.department")} />
                            <Input placeholder="Subjects (comma separated)" {...register("profile.subjects")} />
                        </>
                    )}

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
                            disabled={!isValid || isSubmitting || (mode === "edit" && !isDirty)}
                        >
                            {mode === "add" ? "Add User" : "Update User"}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
};

export default AddUserForm;
