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
  staffSchema,
  type StaffFormValues,
} from "@/schemas/staff.schema";

import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import {
  createStaff,
  updateStaff,
} from "@/api/staff";

import type { Staff } from "@/types/staff";

interface AddStaffFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "view" | "edit";
  staff?: Staff | null;
  onSuccess: () => void;
}

const AddStaffForm = ({
  open,
  onOpenChange,
  mode,
  staff,
  onSuccess,
}: AddStaffFormProps) => {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
    reset,
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    mode: "onChange",
    defaultValues: {
      staffName: "",
      staffDesignation: "",
      staffPhone: "",
      rfidCode: "",
    },
  });

  /* ================= RESET FORM ================= */

  useEffect(() => {
    if (mode === "edit" && staff) {
      reset({
        staffName: staff.staffName,
        staffDesignation: staff.staffDesignation,
        staffPhone: staff.staffPhone,
        rfidCode: staff.rfidCode ?? "",
      });
    } else {
      reset({
        staffName: "",
        staffDesignation: "",
        staffPhone: "",
        rfidCode: "",
      });
    }
  }, [staff, mode, reset]);

  /* ================= SUBMIT ================= */

  const onSubmit = async (data: StaffFormValues) => {
    if (!orgId) return;

    try {
      if (mode === "add") {
        await createStaff(orgId, data);
        toast.success("Staff added successfully");
      }

      if (mode === "edit" && staff) {
        await updateStaff({
          staffId: staff.staffId,
          orgId,
          ...data,
        });
        toast.success("Staff updated successfully");
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
            {mode === "add" && "Add Staff"}
            {mode === "view" && "View Staff"}
            {mode === "edit" && "Edit Staff"}
          </SheetTitle>
          <SheetDescription>
            {mode === "view"
              ? "Staff details"
              : "Enter staff details"}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 mt-2"
        >
          {(
            [
              ["staffName", "Staff Name"],
              ["staffDesignation", "Designation"],
              ["staffPhone", "Phone"],
              ["rfidCode", "RFID Code"],
            ] as const
          ).map(([field, label]) => (
            <div key={field} className="space-y-1.5">
              <Label>{label} *</Label>

              <Input
                {...register(field)}
                disabled={mode === "view"}
                maxLength={
                  field === "staffPhone" ? 10 : undefined
                }
                inputMode={
                  field === "staffPhone"
                    ? "numeric"
                    : undefined
                }
                onInput={(e) => {
                  if (field === "staffPhone") {
                    e.currentTarget.value =
                      e.currentTarget.value.replace(
                        /\D/g,
                        ""
                      );
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
              {mode === "add" && "Add Staff"}
              {mode === "edit" && "Update Staff"}
              {mode === "view" && "Close"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddStaffForm;
