import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

import { listGrades, listSections } from "@/api/academics";
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
  const { user } = useAuth();
  const orgId = user?.orgId;

  const [grades, setGrades] = useState<AcademicItem[]>([]);
  const [sections, setSections] = useState<AcademicItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    mode: "onChange",
    defaultValues: {
      userType: "STUDENT",
    },
  });

  const dob = watch("profile.dob");
  const photo = watch("profilePhoto");

  useEffect(() => {
    if (!orgId) return;

    const init = async () => {
      const [g, s] = await Promise.all([
        listGrades(orgId),
        listSections(orgId),
      ]);
      setGrades(g || []);
      setSections(s || []);
    };

    init();
  }, [orgId]);

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

      // ✅ IMPORTANT: fetch doesn't throw on HTTP errors
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

  const onSubmit = async (data: UserFormValues) => {
    if (!orgId) return;

    try {
      await createUser(orgId, data);
      toast.success("Student added successfully");
      navigate("/students");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create user");
    }
  };

  return (
    <div className="space-y-6 lg:p-6 md:p-3">
      {/* Breadcrumb */}
      <AppBreadcrumb />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Add Student</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage student details
          </p>
        </div>

        <Button variant="outline" onClick={() => navigate("/students")}>
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* PROFILE PHOTO */}
            <div className="space-y-3">
              <Label>Profile Photo</Label>

              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
                  {photo ? (
                    <img src={photo} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg text-muted-foreground">
                      {watch("name")?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="secondary"
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

            <Separator />

            {/* BASIC INFO */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label>Name *</Label>
                  <Input {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Father's Name</Label>
                  <Input {...register("profile.fatherName")} />
                </div>

                <div>
                  <Label className="mb-1">Phone *</Label>
                  <Input {...register("phone")} maxLength={10} />
                  {errors.phone && (
                    <p className="text-sm text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="mb-1">Email *</Label>
                  <Input {...register("email")} />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>External ID</Label>
                  <Input {...register("externalId")} />
                </div>

                <div className="space-y-1.5">
                  <Label>RFID *</Label>
                  <Input {...register("rfidCode")} />
                </div>
              </div>
            </div>

            <Separator />

            {/* ACADEMIC */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Academic Details
              </h3>

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

                <div className="space-y-1.5">
                  <Label>Roll Number *</Label>
                  <Input {...register("profile.rollNumber")} />
                </div>
              </div>
            </div>

            <Separator />

            {/* PERSONAL */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Personal Details
              </h3>

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
                        {dob
                          ? new Date(dob).toLocaleDateString()
                          : "Select date"}
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
                            setValue("profile.dob", date.toISOString(), {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
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
                    onValueChange={(val) =>
                      setValue(
                        "profile.gender",
                        val as (typeof GENDERS)[number]
                      )
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
                    onValueChange={(val) =>
                      setValue(
                        "profile.bloodGroup",
                        val as (typeof BLOOD_GROUPS)[number]
                      )
                    }
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
            </div>

            <Separator />

            {/* ADDRESS */}
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input {...register("profile.address")} />
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/students")}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="bg-primary"
              >
                Add Student
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddPeoplePage;
