import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { toast } from "sonner"

import { listPayrollPayees, upsertPayrollPaymentDetails } from "@/api/payrollManagement"
import type {
  PayrollPayeeOption,
  PayrollPaymentDetailsRecord,
  PayrollPaymentMode,
} from "@/types/payroll-management"
import {
  payrollPaymentDetailsSchema,
  type PayrollPaymentDetailsFormValues,
} from "@/schemas/payroll.schema"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const paymentModeOptions: Array<{
  value: PayrollPaymentMode
  label: string
}> = [
  { value: "BANK", label: "Bank" },
  { value: "UPI", label: "UPI" },
  { value: "BANK_AND_UPI", label: "Bank + UPI" },
]

const initialFormValues: PayrollPaymentDetailsFormValues = {
  userType: "STAFF",
  userId: "",
  userName: "",
  department: "",
  paymentMode: "BANK",
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  bankName: "",
  branchName: "",
  upiId: "",
  isActive: true,
}

function getEmployeeLabel(employee?: PayrollPayeeOption | null): string {
  if (!employee) return "Search employee"
  return `${employee.userName} · ${employee.department}`
}

function EmployeeAutocomplete({
  value,
  options,
  disabled,
  onChange,
}: {
  value: string
  options: PayrollPayeeOption[]
  disabled?: boolean
  onChange: (employee: PayrollPayeeOption) => void
}) {
  const [open, setOpen] = useState(false)
  const selectedEmployee = options.find((item) => item.userId === value) ?? null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-11 w-full justify-between rounded-xl px-3 font-normal shadow-none",
            !selectedEmployee && "text-muted-foreground"
          )}
        >
          <span className="truncate">{getEmployeeLabel(selectedEmployee)}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popper-anchor-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Search by name, id, or department" />
          <CommandList>
            <CommandEmpty>No employee found.</CommandEmpty>
            <CommandGroup>
              {options.map((employee) => (
                <CommandItem
                  key={employee.userId}
                  value={`${employee.userName} ${employee.userId} ${employee.department}`}
                  onSelect={() => {
                    onChange(employee)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      employee.userId === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{employee.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {employee.userId} · {employee.department}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface PaymentDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orgId: string
  record: PayrollPaymentDetailsRecord | null
  onSaved: () => Promise<void> | void
}

export default function PaymentDetailsDialog({
  open,
  onOpenChange,
  orgId,
  record,
  onSaved,
}: PaymentDetailsDialogProps) {
  const [saving, setSaving] = useState(false)
  const [payees, setPayees] = useState<PayrollPayeeOption[]>([])

  const isEditing = Boolean(record)

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PayrollPaymentDetailsFormValues>({
    resolver: zodResolver(payrollPaymentDetailsSchema) as any,
    defaultValues: initialFormValues,
  })

  const watchedUserType = watch("userType")
  const watchedPaymentMode = watch("paymentMode")
  const watchedUserId = watch("userId")

  useEffect(() => {
    if (!open) return

    if (record) {
      reset({
        userType: record.userType,
        userId: record.userId,
        userName: record.userName,
        department: record.department,
        paymentMode: record.paymentMode,
        accountHolderName: record.bankDetails?.accountHolderName ?? "",
        accountNumber: record.bankDetails?.accountNumber ?? "",
        ifscCode: record.bankDetails?.ifscCode ?? "",
        bankName: record.bankDetails?.bankName ?? "",
        branchName: record.bankDetails?.branchName ?? "",
        upiId: record.upiDetails?.upiId ?? "",
        isActive: record.isActive,
      })
    } else {
      reset(initialFormValues)
    }
  }, [open, record, reset])

  useEffect(() => {
    if (!open || !orgId) return

    listPayrollPayees(orgId, watchedUserType)
      .then((payeesData) => setPayees(payeesData))
      .catch((error) => {
        console.error(error)
        toast.error("Failed to load employee list")
      })
  }, [open, orgId, watchedUserType])

  useEffect(() => {
    if (!watchedUserId) return

    const selectedPayee = payees.find((item) => item.userId === watchedUserId)
    if (!selectedPayee) return

    setValue("userName", selectedPayee.userName, { shouldValidate: true })
    setValue("department", selectedPayee.department, { shouldValidate: true })
  }, [payees, setValue, watchedUserId])

  const closeDialog = () => {
    onOpenChange(false)
    reset(initialFormValues)
  }

  const onSubmit = async (values: PayrollPaymentDetailsFormValues) => {
    if (!orgId) return

    const selectedPayee = payees.find((item) => item.userId === values.userId)
    if (!selectedPayee) {
      toast.error("Please select an employee")
      return
    }

    setSaving(true)
    try {
      await upsertPayrollPaymentDetails(orgId, {
        userId: selectedPayee.userId,
        userName: selectedPayee.userName,
        userType: selectedPayee.userType,
        department: selectedPayee.department,
        paymentMode: values.paymentMode,
        bankDetails:
          values.paymentMode === "UPI"
            ? undefined
            : {
                accountHolderName: values.accountHolderName,
                accountNumber: values.accountNumber,
                ifscCode: values.ifscCode.toUpperCase(),
                bankName: values.bankName,
                branchName: values.branchName?.trim() || undefined,
              },
        upiDetails:
          values.paymentMode === "BANK"
            ? undefined
            : {
                upiId: values.upiId.trim(),
              },
        isActive: values.isActive,
      })

      toast.success("Payment details saved")
      await onSaved()
      closeDialog()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save payment details"
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : closeDialog())}>
      <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-hidden border-0 bg-background p-0 shadow-2xl">
        <div className="grid max-h-[92vh] md:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white">
            <DialogHeader className="text-left">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                <Plus className="h-3.5 w-3.5" />
                Payroll payment profile
              </div>
              <DialogTitle className="text-2xl text-white">
                {isEditing ? "Edit Payment Details" : "Add Payment Details"}
              </DialogTitle>
              <DialogDescription className="max-w-md text-slate-300">
                Save bank or UPI details for faculty and staff. IFSC is normalized to uppercase before validation.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 grid gap-3">
              {[
                "Choose staff or faculty",
                "Pick the employee from payroll list",
                "Store bank, UPI, or both",
              ].map((item, index) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{item}</p>
                    <p className="text-sm text-slate-300">Keep payout records clean and ready for payroll processing.</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">Validation notes</p>
              <p className="mt-1">Account number, IFSC, and UPI are checked before saving. Lowercase IFSC values are accepted and normalized.</p>
            </div>
          </div>

          <ScrollArea className="max-h-[92vh]">
            <div className="p-6">
              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Employee Type</p>
                    <Controller
                      control={control}
                      name="userType"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value)
                            setValue("userId", "")
                            setValue("userName", "")
                            setValue("department", "")
                          }}
                          disabled={isEditing}
                        >
                          <SelectTrigger className="h-11 rounded-xl bg-muted/40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STAFF">Staff</SelectItem>
                            <SelectItem value="FACULTY">Faculty</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.userType && <p className="text-xs text-red-600">{errors.userType.message}</p>}
                  </div>

                  <div className="space-y-2 col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Employee</p>
                    <Controller
                      control={control}
                      name="userId"
                      render={({ field }) => (
                        <EmployeeAutocomplete
                          value={field.value}
                          options={payees}
                          disabled={isEditing}
                          onChange={(employee) => {
                            field.onChange(employee.userId)
                            setValue("userName", employee.userName, { shouldValidate: true })
                            setValue("department", employee.department, { shouldValidate: true })
                          }}
                        />
                      )}
                    />
                    {errors.userId && <p className="text-xs text-red-600">{errors.userId.message}</p>}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Payment Mode</p>
                    <Controller
                      control={control}
                      name="paymentMode"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                          <SelectTrigger className="h-11 rounded-xl bg-muted/40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentModeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.paymentMode && <p className="text-xs text-red-600">{errors.paymentMode.message}</p>}
                  </div>
                </div>

                <div className="grid gap-4 rounded-2xl border border-border bg-muted/20 p-4 sm:grid-cols-2">
                  {(watchedPaymentMode === "BANK" || watchedPaymentMode === "BANK_AND_UPI") && (
                    <>
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Account Holder</p>
                        <Input className="h-11 rounded-xl" placeholder="Account holder name" {...register("accountHolderName")} />
                        {errors.accountHolderName && <p className="text-xs text-red-600">{errors.accountHolderName.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Account Number</p>
                        <Input className="h-11 rounded-xl" placeholder="1234567890" {...register("accountNumber")} />
                        {errors.accountNumber && <p className="text-xs text-red-600">{errors.accountNumber.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">IFSC Code</p>
                        <Controller
                          control={control}
                          name="ifscCode"
                          render={({ field }) => (
                            <Input
                              className="h-11 rounded-xl uppercase tracking-[0.25em]"
                              placeholder="HDFC0XXXXXX"
                              value={field.value}
                              onChange={(event) => field.onChange(event.target.value.toUpperCase().trim())}
                            />
                          )}
                        />
                        {errors.ifscCode && <p className="text-xs text-red-600">{errors.ifscCode.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bank Name</p>
                        <Input className="h-11 rounded-xl" placeholder="Bank name" {...register("bankName")} />
                        {errors.bankName && <p className="text-xs text-red-600">{errors.bankName.message}</p>}
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Branch Name</p>
                        <Input className="h-11 rounded-xl" placeholder="Branch name (optional)" {...register("branchName")} />
                      </div>
                    </>
                  )}

                  {(watchedPaymentMode === "UPI" || watchedPaymentMode === "BANK_AND_UPI") && (
                    <div className="space-y-2 sm:col-span-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">UPI ID</p>
                      <Input className="h-11 rounded-xl" placeholder="name@bank" {...register("upiId")} />
                      {errors.upiId && <p className="text-xs text-red-600">{errors.upiId.message}</p>}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 border-t pt-4">
                  <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                  <Button type="submit" disabled={saving} className="bg-primary">
                    {saving ? "Saving..." : "Save Details"}
                  </Button>
                </div>
              </form>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
