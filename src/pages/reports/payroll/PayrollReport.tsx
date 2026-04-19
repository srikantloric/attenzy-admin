import { useMemo, useState } from "react"
import { format, parse } from "date-fns"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { Download, HandCoins } from "lucide-react"

import useAuth from "@/hooks/useAuth"
import { getPayrollReport } from "@/api/reports/payroll"
import type {
  PayrollEmployeeRecord,
  PayrollQuery,
  PayrollReportResponse,
} from "@/types/reports/payroll"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

const monthOptions = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
]

function currency(value: number): string {
  return `INR ${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function monthLabel(value: string): string {
  const parsed = parse(value, "yyyy-MM", new Date())
  return format(parsed, "MMMM yyyy")
}

export default function PayrollReport() {
  const { user } = useAuth()
  const orgId = user?.orgId ?? ""

  const currentDate = new Date()

  const [month, setMonth] = useState(format(currentDate, "MM"))
  const [year, setYear] = useState(format(currentDate, "yyyy"))
  const [userType, setUserType] = useState<PayrollQuery["userType"]>("ALL")
  const [search, setSearch] = useState("")

  const [report, setReport] = useState<PayrollReportResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const yearOptions = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, i) =>
        (currentDate.getFullYear() - i).toString()
      ),
    [currentDate]
  )

  const handleGenerate = async () => {
    if (!orgId) return

    setLoading(true)

    try {
      const response = await getPayrollReport(orgId, {
        month: `${year}-${month}`,
        userType,
        search,
      })

      setReport(response)
    } catch (error) {
      console.error(error)
      setReport(null)
    } finally {
      setLoading(false)
    }
  }

  const exportToExcel = () => {
    if (!report) return

    const header = [
      "Employee",
      "Type",
      "Department",
      "Working Days",
      "Present",
      "Half Day",
      "Late Come",
      "Leave",
      "Paid Leave",
      "Unpaid Leave",
      "Payable Days",
      "Gross Salary",
      "Per Day Rate",
      "Late Penalty",
      "Deductions",
      "Net Pay",
    ]

    const rows = report.records.map((row) => [
      row.name,
      row.userType,
      row.department,
      row.workingDays,
      row.presentDays,
      row.halfDays,
      row.lateComings,
      row.leaveDays,
      row.paidLeaveUsed,
      row.unpaidLeaveDays,
      row.payableDays,
      row.grossSalary,
      row.perDayRate,
      row.lateComePenaltyAmount,
      row.deductionAmount,
      row.netPay,
    ])

    const totals = [
      "TOTAL",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      report.summary.totalPayableDays,
      report.summary.grossPayout,
      "",
      "",
      "",
      report.summary.totalDeductions,
      report.summary.netPayout,
    ]

    const sheet = XLSX.utils.aoa_to_sheet([header, ...rows, totals])
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, sheet, "Payroll")

    const blob = new Blob(
      [XLSX.write(workbook, { bookType: "xlsx", type: "array" })],
      { type: "application/octet-stream" }
    )

    saveAs(blob, `Payroll-${report.month}.xlsx`)
  }

  return (
    <div className="w-full py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <HandCoins className="h-6 w-6" />
          Payroll Report
        </h1>
        <p className="text-sm text-muted-foreground">
          Salary sheet for staff and faculty with half-day and leave handling.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Payroll</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-wrap items-end gap-3">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={userType}
            onValueChange={(value) =>
              setUserType(value as PayrollQuery["userType"])
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Employee Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="STAFF">Staff</SelectItem>
              <SelectItem value="FACULTY">Faculty</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Search by name or department"
            className="w-full sm:w-64"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <Button onClick={handleGenerate}>
            {loading ? "Loading..." : "Generate"}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <>
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle>
                Payroll Summary - {monthLabel(report.month)}
              </CardTitle>
              <Button variant="outline" size="icon" onClick={exportToExcel}>
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Employees</p>
                <p className="text-xl font-semibold">{report.summary.employeeCount}</p>
              </div>

              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Gross Payout</p>
                <p className="text-xl font-semibold">
                  {currency(report.summary.grossPayout)}
                </p>
              </div>

              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Total Deductions</p>
                <p className="text-xl font-semibold text-red-600">
                  {currency(report.summary.totalDeductions)}
                </p>
              </div>

              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Net Payout</p>
                <p className="text-xl font-semibold text-green-700">
                  {currency(report.summary.netPayout)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payroll Policy Used</CardTitle>
            </CardHeader>

            <CardContent className="text-sm text-muted-foreground flex flex-wrap gap-2">
              <Badge variant="secondary">
                Half-day = {report.policy.halfDayWeight} payable day
              </Badge>
              <Badge variant="secondary">
                Paid leave limit = {report.policy.paidLeavePerMonth} / month
              </Badge>
              <Badge variant="secondary">
                Late coming penalty = INR {report.policy.lateComePenaltyPerOccurrence}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0 overflow-auto">
              <table className="w-full min-w-270 text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="p-3 text-left">Employee</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Department</th>
                    <th className="p-3 text-center">Working</th>
                    <th className="p-3 text-center">Present</th>
                    <th className="p-3 text-center">Half Day</th>
                    <th className="p-3 text-center">Late Come</th>
                    <th className="p-3 text-center">Leave</th>
                    <th className="p-3 text-center">Paid Leave</th>
                    <th className="p-3 text-center">Unpaid Leave</th>
                    <th className="p-3 text-center">Payable Days</th>
                    <th className="p-3 text-right">Gross</th>
                    <th className="p-3 text-right">Late Penalty</th>
                    <th className="p-3 text-right">Deduction</th>
                    <th className="p-3 text-right">Net Pay</th>
                  </tr>
                </thead>

                <tbody>
                  {report.records.length === 0 && (
                    <tr>
                      <td
                        className="p-6 text-center text-muted-foreground"
                        colSpan={16}
                      >
                        No employees found for selected filters.
                      </td>
                    </tr>
                  )}

                  {report.records.map((row: PayrollEmployeeRecord) => (
                    <tr key={row.userId} className="border-t">
                      <td className="p-3 font-medium">{row.name}</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            row.userType === "FACULTY" ? "default" : "outline"
                          }
                        >
                          {row.userType}
                        </Badge>
                      </td>
                      <td className="p-3">{row.department}</td>
                      <td className="p-3 text-center">{row.workingDays}</td>
                      <td className="p-3 text-center">{row.presentDays}</td>
                      <td className="p-3 text-center">{row.halfDays}</td>
                      <td className="p-3 text-center">{row.lateComings}</td>
                      <td className="p-3 text-center">{row.leaveDays}</td>
                      <td className="p-3 text-center">{row.paidLeaveUsed}</td>
                      <td className="p-3 text-center text-red-600">
                        {row.unpaidLeaveDays}
                      </td>
                      <td className="p-3 text-center font-medium">
                        {row.payableDays}
                      </td>
                      <td className="p-3 text-right">{currency(row.grossSalary)}</td>
                      <td className="p-3 text-right text-orange-600">
                        {currency(row.lateComePenaltyAmount)}
                      </td>
                      <td className="p-3 text-right text-red-600">
                        {currency(row.deductionAmount)}
                      </td>
                      <td className="p-3 text-right font-semibold text-green-700">
                        {currency(row.netPay)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
