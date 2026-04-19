import { useEffect, useState } from "react"

import useAuth from "@/hooks/useAuth"
import {
  getPayrollDeductionPolicy,
  getPayrollPaymentSetup,
  updatePayrollDeductionPolicy,
  updatePayrollPaymentSetup,
} from "@/api/payrollManagement"
import type { PayrollDeductionPolicy, PayrollPaymentSetup } from "@/types/payroll-management"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const defaultState: PayrollPaymentSetup = {
  cycleType: "MONTHLY",
  payoutDay: 30,
  currency: "INR",
  payoutMode: "BANK_TRANSFER",
  approvalRequired: true,
  paidLeavePerMonth: 2,
  halfDayWeight: 0.5,
}

const defaultDeductionPolicy: PayrollDeductionPolicy = {
  leaveDeductionPerDay: 1,
  halfDayDeductionFraction: 0.5,
  lateComePenaltyPerOccurrence: 250,
}

export default function PaymentSetup() {
  const { user } = useAuth()
  const orgId = user?.orgId ?? ""

  const [form, setForm] = useState<PayrollPaymentSetup>(defaultState)
  const [deductionPolicy, setDeductionPolicy] =
    useState<PayrollDeductionPolicy>(defaultDeductionPolicy)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  useEffect(() => {
    if (!orgId) return

    Promise.all([
      getPayrollPaymentSetup(orgId),
      getPayrollDeductionPolicy(orgId),
    ])
      .then(([setupRes, deductionRes]) => {
        setForm(setupRes)
        setDeductionPolicy(deductionRes)
      })
      .catch((error) => {
        console.error(error)
        toast.error("Failed to load payroll setup")
      })
  }, [orgId])

  const onSave = async () => {
    if (!orgId) return

    setSaving(true)
    try {
      const [updatedSetup, updatedDeductions] = await Promise.all([
        updatePayrollPaymentSetup(orgId, form),
        updatePayrollDeductionPolicy(orgId, deductionPolicy),
      ])
      setForm(updatedSetup)
      setDeductionPolicy(updatedDeductions)
      setSavedAt(new Date().toLocaleString())
      toast.success("Payroll setup saved")
    } catch (error) {
      console.error(error)
      toast.error("Failed to save payroll setup")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payment Setup</h1>
        <p className="text-sm text-muted-foreground">
          Configure payout settings and deduction policy in one place.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Configuration</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Cycle Type</p>
            <Select
              value={form.cycleType}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  cycleType: value as PayrollPaymentSetup["cycleType"],
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Cycle Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="BIWEEKLY">Biweekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Payout Day</p>
            <Input
              type="number"
              value={form.payoutDay}
              min={1}
              max={31}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, payoutDay: Number(event.target.value) }))
              }
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Currency</p>
            <Input
              value={form.currency}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))
              }
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Payout Mode</p>
            <Select
              value={form.payoutMode}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  payoutMode: value as PayrollPaymentSetup["payoutMode"],
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Payout Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="MIXED">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Paid Leave / Month</p>
            <Input
              type="number"
              min={0}
              value={form.paidLeavePerMonth}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  paidLeavePerMonth: Number(event.target.value),
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Half Day Weight</p>
            <Input
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={form.halfDayWeight}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  halfDayWeight: Number(event.target.value),
                }))
              }
            />
          </div>

          <div className="sm:col-span-2 flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Last saved: {savedAt ?? "Not saved in this session"}
            </p>
            <Button onClick={onSave}>{saving ? "Saving..." : "Save All Changes"}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deduction Policy</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Leave Deduction</p>
            <Input
              type="number"
              min={0}
              step={0.1}
              value={deductionPolicy.leaveDeductionPerDay}
              onChange={(event) =>
                setDeductionPolicy((prev) => ({
                  ...prev,
                  leaveDeductionPerDay: Number(event.target.value),
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Full day leave deduction as payroll days.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Half Day Deduction</p>
            <Input
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={deductionPolicy.halfDayDeductionFraction}
              onChange={(event) =>
                setDeductionPolicy((prev) => ({
                  ...prev,
                  halfDayDeductionFraction: Number(event.target.value),
                }))
              }
            />
            <p className="text-xs text-muted-foreground">Use 0.5 for half-day deduction.</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Late Come Penalty</p>
            <Input
              type="number"
              min={0}
              step={1}
              value={deductionPolicy.lateComePenaltyPerOccurrence}
              onChange={(event) =>
                setDeductionPolicy((prev) => ({
                  ...prev,
                  lateComePenaltyPerOccurrence: Number(event.target.value),
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Fixed penalty applied per late-coming instance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
