import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { AppBreadcrumb } from "@/components/AppBreadCrumb";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { userSchema, type UserFormValues } from "@/schemas/user.schema";

import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { createUser, getSignedUploadUrl } from "@/api/users";

import { listGrades, listSections, listDepartments } from "@/api/academics";
import type { AcademicItem } from "@/types/academics";

const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;
const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "O+",
  "O-",
  "AB+",
  "AB-",
] as const;

const AddPeoplePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultUserType = location.state?.userType || "STUDENT";

  const { user } = useAuth();
  const orgId = user?.orgId;

  const [grades, setGrades] = useState<AcademicItem[]>([]);
  const [sections, setSections] = useState<AcademicItem[]>([]);
  const [departments, setDepartments] = useState<AcademicItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    resetField,
    formState: { errors, isSubmitting, isValid },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    mode: "onChange",
    defaultValues: {
      userType: defaultUserType,
    },
  });

  const selectedType = watch("userType");
  const dob = watch("dob");
  const photo = watch("profilePhoto");
  const gender = watch("gender");

  /* ================= FETCH ================= */

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

  /* ================= RESET PROFILE ================= */

  useEffect(() => {
    resetField("profile");
  }, [selectedType]);

  /* ================= FILE UPLOAD ================= */

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
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      // IMPORTANT: fetch doesn't throw on HTTP errors
      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        throw new Error(errorText || "Failed to upload file to storage (S3)");
      }

      // 3. Save PUBLIC URL
      setValue("profilePhoto", publicUrl, {
        shouldDirty: true,
        shouldValidate: true,
      });

      toast.success("Uploaded successfully");
    } catch (err: any) {
      console.error("Upload error:", err);

      toast.error(
        err?.message || // custom thrown error
          err?.response?.data?.message || // backend error
          "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  /* ================= SUBMIT ================= */

  const onSubmit = async (data: UserFormValues) => {
    if (!orgId) return;

    try {
      await createUser(orgId, data);
      toast.success(`${data.userType} added successfully`);
      navigate(`/${data.userType.toLowerCase()}s`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create user");
    }
  };

  useEffect(() => {
    if (defaultUserType) {
      setValue("userType", defaultUserType);
    }
  }, [defaultUserType, setValue]);

  return (
    <div className="space-y-6 lg:p-6 md:p-3">
      <AppBreadcrumb />

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Add {selectedType.charAt(0) + selectedType.slice(1).toLowerCase()}
          </h1>
          <p className="text-sm text-muted-foreground">
            Create and manage {selectedType.toLowerCase()} details
          </p>
        </div>

        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 mx-2 mt-1 overflow-y-auto overflow-hidden pr-2 flex-1"
          >
            {/* PROFILE PHOTO */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-muted-foreground">
                Profile Photo
              </Label>

              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border bg-muted shadow-sm flex items-center justify-center transition">
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

                  {/* Hover Overlay */}
                  <label className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition cursor-pointer">
                    {uploading ? "Uploading..." : "Change"}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                  </label>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-9 px-4"
                    onClick={() => document.getElementById("upload")?.click()}
                  >
                    Upload Image
                  </Button>

                  <input
                    id="upload"
                    type="file"
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
                      className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
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

            {/* BASIC FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="mb-1">Name *</Label>
                <Input {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="mb-1">Father's Name</Label>
                <Input {...register("fatherName")} />
              </div>

              <div>
                <Label className="mb-1">Phone *</Label>
                <Input {...register("phone")} maxLength={10} />
              </div>

              <div>
                <Label className="mb-1">Email *</Label>
                <Input {...register("email")} />
              </div>

              <div>
                <Label className="mb-1">RFID *</Label>
                <Input {...register("rfidCode")} />
              </div>

              <div>
                <Label className="mb-1">External ID</Label>
                <Input {...register("externalId")} />
              </div>
            </div>

            <Separator />

            {/* TYPE SPECIFIC */}

            {selectedType === "STUDENT" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <Label>Grade *</Label>
                    <Select
                      onValueChange={(val) => setValue("profile.class", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.map((g) => (
                          <SelectItem key={g.gradeId} value={g.name}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Section *</Label>
                    <Select
                      onValueChange={(val) => setValue("profile.section", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((s) => (
                          <SelectItem key={s.sectionId} value={s.name}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-1">Roll Number *</Label>
                    <Input {...register("profile.rollNumber")} />
                  </div>
                </div>
              </>
            )}

            {selectedType === "STAFF" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label className="mb-1">Designation *</Label>
                    <Input {...register("profile.designation")} />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Department *</Label>
                    <Select
                      onValueChange={(val) =>
                        setValue("profile.department", val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.departmentId} value={d.name}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {selectedType === "FACULTY" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label>Department *</Label>
                    <Select
                      onValueChange={(val) =>
                        setValue("profile.department", val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.departmentId} value={d.name}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-1">Subjects *</Label>
                    <Input {...register("profile.subjects")} />
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* COMMON PERSONAL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <Label>Date of Birth</Label>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start font-normal ${
                        !dob && "text-muted-foreground"
                      }`}
                    >
                      {dob ? new Date(dob).toLocaleDateString() : "Select date"}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={dob ? new Date(dob) : undefined}
                      defaultMonth={dob ? new Date(dob) : undefined}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        if (date) {
                          setValue(
                            "dob",
                            date.toISOString().split("T")[0], // YYYY-MM-DD
                            {
                              shouldDirty: true,
                              shouldValidate: true,
                            }
                          );
                        }
                      }}
                      disabled={(date) => date > new Date()} // prevent future DOB
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <Label>Gender</Label>
                <Select
                  value={gender}
                  onValueChange={(val) =>
                    setValue("gender", val as any, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Blood Group</Label>
                <Select
                  onValueChange={(val) => setValue("bloodGroup", val as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Blood Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((bg) => (
                      <SelectItem key={bg} value={bg}>
                        {bg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="mb-1">Address</Label>
              <Input {...register("address")} />
            </div>

            <Separator />

            {/* ACTIONS */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>

              <Button disabled={!isValid || isSubmitting}>
                Add{" "}
                {selectedType.charAt(0) + selectedType.slice(1).toLowerCase()}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddPeoplePage;
