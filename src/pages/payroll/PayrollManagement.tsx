import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"

import useAuth from "@/hooks/useAuth"
import { listIndividualPayouts, listPayrollDues } from "@/api/payrollManagement"
import type { IndividualPayout, PayrollDue } from "@/types/payroll-management"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function money(value: number): string {
  return `INR ${value.toLocaleString("en-IN")}`
}

function statusClass(status: IndividualPayout["status"]): string {
  if (status === "PAID") return "bg-green-100 text-green-700"
  if (status === "PROCESSING") return "bg-blue-100 text-blue-700"
  if (status === "FAILED") return "bg-red-100 text-red-700"
  return "bg-yellow-100 text-yellow-700"
}

export default function PayrollManagement() {
  const { user } = useAuth()
  const orgId = user?.orgId ?? ""

  const [month] = useState(format(new Date(), "yyyy-MM"))
  const [payouts, setPayouts] = useState<IndividualPayout[]>([])
  const [dues, setDues] = useState<PayrollDue[]>([])

  useEffect(() => {
    if (!orgId) return

    const load = async () => {
      const [payoutData, dueData] = await Promise.all([
        listIndividualPayouts(orgId, { month }),
        listPayrollDues(orgId),
      ])

      setPayouts(payoutData)
      setDues(dueData)
    }

    load().catch((error) => console.error(error))
  }, [orgId, month])

  const openDues = useMemo(
    () => dues.filter((item) => item.status !== "CLOSED"),
    [dues]
  )

  const totalGross = useMemo(
    () => payouts.reduce((sum, item) => sum + item.grossAmount, 0),
    [payouts]
  )

  const totalDeductions = useMemo(
    () => payouts.reduce((sum, item) => sum + item.deductionAmount, 0),
    [payouts]
  )

  const totalNet = useMemo(
    () => payouts.reduce((sum, item) => sum + item.netAmount, 0),
    [payouts]
  )

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payroll Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage individual payouts and outstanding dues.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Payout Count</p>
            <p className="text-2xl font-semibold">{payouts.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Gross Payout</p>
            <p className="text-2xl font-semibold">{money(totalGross)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Deductions</p>
            <p className="text-2xl font-semibold text-red-600">
              {money(totalDeductions)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Net Payout</p>
            <p className="text-2xl font-semibold text-green-700">
              {money(totalNet)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Individual Payouts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {payouts.slice(0, 4).map((run) => (
              <div key={run.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{run.userName}</p>
                  <Badge className={statusClass(run.status)}>{run.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {run.month} | Net: {money(run.netAmount)}
                </p>
              </div>
            ))}
            {payouts.length === 0 && (
              <p className="text-sm text-muted-foreground">No individual payouts for current month.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Dues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {openDues.map((due) => (
              <div key={due.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{due.employeeName}</p>
                  <Badge variant="secondary">{due.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {due.reason} | {money(due.amount)}
                </p>
              </div>
            ))}
            {openDues.length === 0 && (
              <p className="text-sm text-muted-foreground">No outstanding dues.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
