import { useEffect, useState } from "react"

import useAuth from "@/hooks/useAuth"
import {
  getPayrollDeductionPolicy,
  updatePayrollDeductionPolicy,
} from "@/api/payrollManagement"
import type { PayrollDeductionPolicy } from "@/types/payroll-management"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function Deductions() {
  const { user } = useAuth()
  const orgId = user?.orgId ?? ""

  const [policy, setPolicy] = useState<PayrollDeductionPolicy>({
    leaveDeductionPerDay: 1,
    halfDayDeductionFraction: 0.5,
    lateComePenaltyPerOccurrence: 250,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!orgId) return

    getPayrollDeductionPolicy(orgId)
      .then((res) => setPolicy(res))
      .catch((error) => {
        console.error(error)
        toast.error("Failed to load deduction policy")
      })
  }, [orgId])

  const onSave = async () => {
    if (!orgId) return

    setSaving(true)
    try {
      const updated = await updatePayrollDeductionPolicy(orgId, policy)
      setPolicy(updated)
      toast.success("Deduction policy saved")
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Failed to save deduction policy")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Deductions</h1>
        <p className="text-sm text-muted-foreground">
          Keep deduction settings simple: leave, half-day, and late-coming penalty.
        </p>
      </div>

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
              value={policy.leaveDeductionPerDay}
              onChange={(event) =>
                setPolicy((prev) => ({
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
              value={policy.halfDayDeductionFraction}
              onChange={(event) =>
                setPolicy((prev) => ({
                  ...prev,
                  halfDayDeductionFraction: Number(event.target.value),
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Use 0.5 for half-day deduction.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Late Come Penalty</p>
            <Input
              type="number"
              min={0}
              step={1}
              value={policy.lateComePenaltyPerOccurrence}
              onChange={(event) =>
                setPolicy((prev) => ({
                  ...prev,
                  lateComePenaltyPerOccurrence: Number(event.target.value),
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Fixed penalty applied per late-coming instance.
            </p>
          </div>

          <div className="sm:col-span-3 flex justify-end pt-2">
            <Button onClick={onSave}>{saving ? "Saving..." : "Save Policy"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
