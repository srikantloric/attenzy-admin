import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
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
import {
  listPayrollPaymentDetails,
  upsertPayrollPaymentDetails,
} from "@/api/payrollManagement";
import type { PayrollPaymentMode } from "@/types/payroll-management";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  const [openSections, setOpenSections] = useState({
    personal: true,
    employment: false,
    payment: false,
  });
  const [paymentMode, setPaymentMode] = useState<PayrollPaymentMode>("BANK");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [upiId, setUpiId] = useState("");
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
  const isPayrollUser = selectedType === "STAFF" || selectedType === "FACULTY";

  const hasValue = (value: unknown) =>
    value !== undefined && value !== null && String(value).trim().length > 0;

  const requiresBank = paymentMode === "BANK" || paymentMode === "BANK_AND_UPI";
  const requiresUpi = paymentMode === "UPI" || paymentMode === "BANK_AND_UPI";

  const completionItems = isPayrollUser
    ? [
        hasValue(watch("name")),
        hasValue(watch("phone")),
        hasValue(watch("email")),
        hasValue(watch("rfidCode")),
        hasValue(watch("profile.department")),
        selectedType === "STAFF"
          ? hasValue(watch("profile.designation"))
          : hasValue(watch("profile.subjects")),
        Number(watch("profile.monthlyPayment")) > 0,
        Number(watch("profile.ctc")) > 0,
        hasValue(paymentMode),
        requiresBank
          ? hasValue(accountHolderName) &&
            hasValue(accountNumber) &&
            hasValue(ifscCode) &&
            hasValue(bankName)
          : true,
        requiresUpi ? hasValue(upiId) : true,
      ]
    : [];

  const formProgress = isPayrollUser
    ? Math.round(
        (completionItems.filter(Boolean).length / Math.max(completionItems.length, 1)) * 100,
      )
    : 0;

  useEffect(() => {
    if (mode === "edit" && user) {
      reset(user);
      return;
    }

    if (mode === "add") {
      reset();
      setValue("userType", defaultUserType);
      setPaymentMode("BANK");
      setAccountHolderName("");
      setAccountNumber("");
      setIfscCode("");
      setBankName("");
      setBranchName("");
      setUpiId("");
    }
  }, [user, mode, defaultUserType, reset, setValue]);

  useEffect(() => {
    if (!orgId || mode !== "edit" || !user?.userId || !isPayrollUser) return;

    listPayrollPaymentDetails(orgId)
      .then((records) => {
        const existing = records.find((item) => item.userId === user.userId);
        if (!existing) return;

        setPaymentMode(existing.paymentMode);
        setAccountHolderName(existing.bankDetails?.accountHolderName ?? "");
        setAccountNumber(existing.bankDetails?.accountNumber ?? "");
        setIfscCode(existing.bankDetails?.ifscCode ?? "");
        setBankName(existing.bankDetails?.bankName ?? "");
        setBranchName(existing.bankDetails?.branchName ?? "");
        setUpiId(existing.upiDetails?.upiId ?? "");
      })
      .catch((error) => {
        console.error(error);
      });
  }, [orgId, mode, user?.userId, isPayrollUser]);

  const validatePaymentDetails = () => {
    if (!isPayrollUser) return true;

    if (requiresBank) {
      if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
        toast.error("Bank details are required for selected payment mode");
        return false;
      }
    }

    if (requiresUpi && !upiId) {
      toast.error("UPI ID is required for selected payment mode");
      return false;
    }

    return true;
  };

  const onSubmit = async (data: UserFormValues) => {
    if (!orgId) return;
    if (!validatePaymentDetails()) return;

    try {
      const normalizedData = userSchema.parse(data);
      let userIdForPayment = user?.userId as string | undefined;

      if (mode === "add") {
        const created = await createUser(orgId, normalizedData);
        userIdForPayment =
          created?.userId || created?.item?.userId || created?.data?.userId;
        toast.success("User added successfully");
      }

      if (mode === "edit" && user) {
        await updateUser(orgId, user.userId, normalizedData);
        userIdForPayment = user.userId;
        toast.success("User updated successfully");
      }

      if (
        (normalizedData.userType === "STAFF" || normalizedData.userType === "FACULTY") &&
        userIdForPayment
      ) {
        const department = normalizedData.profile.department || "";
        await upsertPayrollPaymentDetails(orgId, {
          userId: userIdForPayment,
          userName: normalizedData.name,
          userType: normalizedData.userType,
          department,
          paymentMode,
          bankDetails: requiresBank
            ? {
                accountHolderName,
                accountNumber,
                ifscCode: ifscCode.toUpperCase(),
                bankName,
                branchName,
              }
            : undefined,
          upiDetails: requiresUpi
            ? {
                upiId,
              }
            : undefined,
          isActive: true,
        });
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
        className="w-full sm:max-w-2xl px-0 py-0 flex flex-col h-full bg-linear-to-b from-background to-muted/30"
      >
        <SheetHeader className="px-6 py-5 border-b bg-background/90 backdrop-blur">
          <SheetTitle className="text-2xl font-semibold tracking-tight">
            {mode === "add" ? "Add User" : "Edit User"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Complete profile, employment, and payout details in one flow.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {/* User Type */}
          <div className="space-y-2 rounded-xl border bg-card p-4 shadow-sm">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">User Type *</Label>
            <Select
              value={selectedType}
              onValueChange={(val) => setValue("userType", val as any)}
            >
              <SelectTrigger className="h-11 bg-background">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
                <SelectItem value="FACULTY">Faculty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isPayrollUser && (
            <div className="space-y-2 rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Completion Progress</span>
                <span className="text-primary">{formProgress}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${formProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Common Fields */}
          <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
            <Label className="text-sm font-semibold">Profile Photo</Label>

            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-muted shadow-md flex items-center justify-center">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border bg-card p-4 shadow-sm">
            <div>
              <Label className="mb-1">External ID</Label>
              <Input className="h-10" {...register("externalId")} />
            </div>

            <div>
              <Label className="mb-1">RFID *</Label>
              <Input className="h-10" {...register("rfidCode")} />
            </div>

            <div>
              <Label className="mb-1">Name *</Label>
              <Input className="h-10" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label className="mb-1">Phone *</Label>
              <Input className="h-10" {...register("phone")} maxLength={10} />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <Label className="mb-1">Email *</Label>
              <Input className="h-10" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
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

          {isPayrollUser && (
            <>
              <Collapsible
                open={openSections.personal}
                onOpenChange={(open) =>
                  setOpenSections((prev) => ({ ...prev, personal: open }))
                }
              >
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between p-4 text-left bg-muted/30"
                    >
                      <span className="font-medium">Personal & Contact</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openSections.personal ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 pb-3 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Use the fields above to complete personal details.
                    </p>
                  </CollapsibleContent>
                </div>
              </Collapsible>

              <Collapsible
                open={openSections.employment}
                onOpenChange={(open) =>
                  setOpenSections((prev) => ({ ...prev, employment: open }))
                }
              >
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between p-4 text-left bg-muted/30"
                    >
                      <span className="font-medium">Employment & Compensation</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openSections.employment ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 pb-3 space-y-4">
                    {selectedType === "STAFF" && (
                      <div>
                        <Label className="mb-1">Designation *</Label>
                        <Input placeholder="Designation" {...register("profile.designation")} />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label>Department *</Label>
                      <Select
                        value={watch("profile.department") || ""}
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

                    {selectedType === "FACULTY" && (
                      <div>
                        <Label className="mb-1">Subjects *</Label>
                        <Input
                          placeholder="Subjects (comma separated)"
                          {...register("profile.subjects")}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="mb-1">Monthly Payment *</Label>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Monthly salary"
                          {...register("profile.monthlyPayment", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div>
                        <Label className="mb-1">CTC *</Label>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Annual CTC"
                          {...register("profile.ctc", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>

              <Collapsible
                open={openSections.payment}
                onOpenChange={(open) =>
                  setOpenSections((prev) => ({ ...prev, payment: open }))
                }
              >
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between p-4 text-left bg-muted/30"
                    >
                      <span className="font-medium">Payment Details</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openSections.payment ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 pb-3 space-y-4">
                    <div className="space-y-1.5">
                      <Label>Payment Mode *</Label>
                      <Select
                        value={paymentMode}
                        onValueChange={(val) => setPaymentMode(val as PayrollPaymentMode)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BANK">Bank</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="BANK_AND_UPI">Bank + UPI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {requiresBank && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          placeholder="Account holder name"
                          value={accountHolderName}
                          onChange={(event) => setAccountHolderName(event.target.value)}
                        />
                        <Input
                          placeholder="Account number"
                          value={accountNumber}
                          onChange={(event) => setAccountNumber(event.target.value)}
                        />
                        <Input
                          placeholder="IFSC code"
                          value={ifscCode}
                          onChange={(event) => setIfscCode(event.target.value.toUpperCase())}
                        />
                        <Input
                          placeholder="Bank name"
                          value={bankName}
                          onChange={(event) => setBankName(event.target.value)}
                        />
                        <Input
                          className="sm:col-span-2"
                          placeholder="Branch name (optional)"
                          value={branchName}
                          onChange={(event) => setBranchName(event.target.value)}
                        />
                      </div>
                    )}

                    {requiresUpi && (
                      <Input
                        placeholder="UPI ID"
                        value={upiId}
                        onChange={(event) => setUpiId(event.target.value)}
                      />
                    )}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </>
          )}
          <Separator />

          <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t -mx-6 px-6 py-4 flex justify-end gap-3">
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
