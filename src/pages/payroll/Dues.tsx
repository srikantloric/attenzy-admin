import { useEffect, useMemo, useState } from "react"

import useAuth from "@/hooks/useAuth"
import { listPayrollDues } from "@/api/payrollManagement"
import type { PayrollDue } from "@/types/payroll-management"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function money(value: number): string {
  return `INR ${value.toLocaleString("en-IN")}`
}

export default function Dues() {
  const { user } = useAuth()
  const orgId = user?.orgId ?? ""

  const [dues, setDues] = useState<PayrollDue[]>([])

  useEffect(() => {
    if (!orgId) return

    listPayrollDues(orgId)
      .then((res) => setDues(res))
      .catch((error) => console.error(error))
  }, [orgId])

  const outstanding = useMemo(
    () => dues.filter((item) => item.status !== "CLOSED"),
    [dues]
  )

  const totalOutstanding = useMemo(
    () => outstanding.reduce((sum, item) => sum + item.amount, 0),
    [outstanding]
  )

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dues</h1>
        <p className="text-sm text-muted-foreground">
          Track outstanding payroll dues, arrears, and pending settlements.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Outstanding: {money(totalOutstanding)}</CardTitle>
        </CardHeader>

        <CardContent className="p-0 overflow-auto">
          <table className="w-full min-w-220 text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="p-3 text-left">Employee</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Month</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-left">Reason</th>
                <th className="p-3 text-left">Due Date</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {dues.map((due) => (
                <tr key={due.id} className="border-t">
                  <td className="p-3 font-medium">{due.employeeName}</td>
                  <td className="p-3">{due.userType}</td>
                  <td className="p-3">{due.month}</td>
                  <td className="p-3 text-right">{money(due.amount)}</td>
                  <td className="p-3">{due.reason}</td>
                  <td className="p-3">{due.dueDate}</td>
                  <td className="p-3 text-center">
                    <Badge variant={due.status === "CLOSED" ? "default" : "secondary"}>
                      {due.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
