import { useEffect, useState } from "react";
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

import { userSchema, type UserFormValues } from "@/schemas/user.schema";

import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { createUser, getSignedUploadUrl, updateUser } from "@/api/users";
import type { UserType } from "@/types/users";
import { listDepartments, listGrades, listSections } from "@/api/academics";
import type { AcademicItem } from "@/types/academics";

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
  const [uploading, setUploading] = useState(false);
  const [grades, setGrades] = useState<AcademicItem[]>([]);
  const [sections, setSections] = useState<AcademicItem[]>([]);
  const [departments, setDepartments] = useState<AcademicItem[]>([]);
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

  const handleFileUpload = async (file: File) => {
    const MAX_SIZE = 5 * 1024 * 1024;
    const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG allowed");
      return;
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      toast.error("Max file size is 5MB");
      return;
    }

    try {
      setUploading(true);

      // 1. Get signed URL
      const res = await getSignedUploadUrl(file.name, file.type, file.size);

      const { uploadUrl, publicUrl } = res;

      // 2. Upload to S3
      await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      // 3. Save PUBLIC URL (IMPORTANT)
      setValue("profilePhoto", publicUrl, {
        shouldDirty: true,
        shouldValidate: true,
      });

      toast.success("Uploaded successfully");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!orgId) return;

    const init = async () => {
      const [g, s, d] = await Promise.all([
        listGrades(orgId),
        listSections(orgId),
        listDepartments(orgId),
      ]);

      setGrades(g || []);
      setSections(s || []);
      setDepartments(d || []);
    };

    init();
  }, [orgId]);

  const photo = watch("profilePhoto");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg px-6 py-2 flex flex-col h-full"
      >
        <SheetHeader className="-ml-4">
          <SheetTitle>{mode === "add" ? "Add User" : "Edit User"}</SheetTitle>
          <SheetDescription>Enter user details</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 mx-2 mt-1 overflow-y-auto overflow-hidden pr-2 flex-1"
        >
          {/* User Type */}
          <div className="space-y-1.5">
            <Label>User Type *</Label>
            <Select
              value={selectedType}
              onValueChange={(val) => setValue("userType", val as any)}
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
          <div className="space-y-4">
            <Label className="text-sm font-medium">Profile Photo</Label>

            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border bg-muted shadow-md flex items-center justify-center">
                  {photo ? (
                    <img
                      src={photo}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-muted-foreground">
                      {watch("name")?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>

                {/* Overlay Upload */}
                <label className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 cursor-pointer transition">
                  {uploading ? "Uploading..." : "Change"}
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);

                      e.target.value = "";
                    }}
                  />
                </label>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    document.getElementById("profileUpload")?.click()
                  }
                >
                  Upload Image
                </Button>

                <input
                  id="profileUpload"
                  type="file"
                  accept="image/png, image/jpeg"
                  disabled={uploading}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />

                {photo && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => setValue("profilePhoto", "")}
                  >
                    Remove
                  </Button>
                )}

                <p className="text-xs text-muted-foreground">
                  JPG, PNG • Max 5MB
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-1">External ID</Label>
            <Input {...register("externalId")} />
          </div>

          <div>
            <Label className="mb-1">Name *</Label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-1">Phone *</Label>
            <Input {...register("phone")} maxLength={10} />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-1">Email *</Label>
            <Input {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-1">RFID *</Label>
            <Input {...register("rfidCode")} />
          </div>

          <Separator />

          {/* Dynamic Profile */}

          {selectedType === "STUDENT" && (
            <>
              <div className="flex gap-2 items-end">
                {/* Grade */}
                <div className="space-y-1.5">
                  <Label>Grade *</Label>
                  <Select
                    onValueChange={(val) => setValue("profile.class", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades
                        .filter((g) => g.isActive)
                        .map((item) => (
                          <SelectItem key={item.gradeId} value={item.name}>
                            {item.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Section */}
                <div className="space-y-1.5">
                  <Label>Section *</Label>
                  <Select
                    onValueChange={(val) => setValue("profile.section", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections
                        .filter((s) => s.isActive)
                        .map((item) => (
                          <SelectItem key={item.sectionId} value={item.name}>
                            {item.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Input
                placeholder="Roll Number"
                {...register("profile.rollNumber")}
              />
            </>
          )}

          {selectedType === "STAFF" && (
            <>
              <Input
                placeholder="Designation"
                {...register("profile.designation")}
              />

              <div className="space-y-1.5">
                <Label>Department *</Label>
                <Select
                  onValueChange={(val) => setValue("profile.department", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments
                      .filter((d) => d.isActive)
                      .map((item) => (
                        <SelectItem key={item.departmentId} value={item.name}>
                          {item.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          {selectedType === "FACULTY" && (
            <>
              <div className="space-y-1.5">
                <Label>Department *</Label>
                <Select
                  onValueChange={(val) => setValue("profile.department", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments
                      .filter((d) => d.isActive)
                      .map((item) => (
                        <SelectItem key={item.departmentId} value={item.name}>
                          {item.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <Input
                placeholder="Subjects (comma separated)"
                {...register("profile.subjects")}
              />
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
              disabled={
                !isValid || isSubmitting || (mode === "edit" && !isDirty)
              }
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
