import { useState, useMemo } from "react"
import { format } from "date-fns"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { Download } from "lucide-react"

import useAuth from "@/hooks/useAuth"
import { getFacultyCalendarView } from "@/api/reports/facultyAttendance"
import type { AttendanceCalendarResponse } from "@/types/reports/attendance"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

import { AttendanceTable } from "@/components/attendance/AttendanceTable"

export default function FacultyAttendance() {
  const { user } = useAuth()
  const orgId = user?.orgId ?? ""

  const currentDate = new Date()

  const [month, setMonth] = useState(format(currentDate, "MM"))
  const [year, setYear] = useState(format(currentDate, "yyyy"))

  const [appliedMonth, setAppliedMonth] = useState(month)
  const [appliedYear, setAppliedYear] = useState(year)

  const [data, setData] = useState<AttendanceCalendarResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

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

  const yearOptions = Array.from({ length: 5 }).map((_, i) =>
    (currentDate.getFullYear() - i).toString()
  )

  /* ================= FETCH ================= */

  const handleRefresh = async () => {
    if (!orgId) return

    setLoading(true)

    try {
      const monthParam = `${year}-${month}`

      const res = await getFacultyCalendarView(
        orgId,
        monthParam
      )

      setData(res)

      // apply filters only after fetch
      setAppliedMonth(month)
      setAppliedYear(year)

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /* ================= SEARCH ================= */

  const filteredUsers = useMemo(() => {
    if (!data) return []

    return data.users.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [data, search])

  /* ================= EXCEL ================= */

  const exportToExcel = () => {
    if (!data) return

    const sheetData: (string | number)[][] = []
    const header = ["Name", "P/W", "%", ...data.days]

    sheetData.push(header)

    filteredUsers.forEach((user) => {
      const row: (string | number)[] = [
        user.name,
        `${user.summary.present}/${user.summary.workingDays}`,
        user.summary.attendancePercentage,
      ]

      data.days.forEach((day) => {
        const status = user.attendance?.[day]
        row.push(status ? status[0] : "-")
      })

      sheetData.push(row)
    })

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, "Faculty Attendance")

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    })

    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    })

    saveAs(blob, `Faculty-Attendance-${appliedYear}-${appliedMonth}.xlsx`)
  }

  const appliedMonthLabel =
    monthOptions.find((m) => m.value === appliedMonth)?.label

  return (
    <div className="w-full py-6 space-y-6">

      {/* FILTER CARD */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Faculty Attendance Record</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-4 items-end">

          {/* Month */}
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Month" />
            </SelectTrigger>

            <SelectContent>
              {monthOptions.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year */}
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Year" />
            </SelectTrigger>

            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleRefresh}>
            {loading ? "Loading..." : "Generate"}
          </Button>

        </CardContent>
      </Card>

      {/* ATTENDANCE LEGEND */}
      {data && (
        <div className="flex flex-wrap items-center gap-3 text-sm">

          <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-medium">
            P — Present
          </span>

          <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-medium">
            A — Absent
          </span>

          <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 font-medium">
            L — Leave
          </span>

          <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
            H — Holiday
          </span>

          <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 font-medium">
            — No Data
          </span>

          <span className="text-blue-600 font-medium ml-2">
            (P/W — Present Days / Working Days)
          </span>

        </div>
      )}

      {/* TABLE CARD */}
      {data && (
        <Card>

          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <CardTitle className="text-lg font-semibold">
              Monthly Attendance — {appliedMonthLabel} {appliedYear}
            </CardTitle>

            <div className="flex items-center gap-3">

              <Input
                placeholder="Search faculty..."
                className="w-full sm:w-60"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <Button
                variant="outline"
                size="icon"
                onClick={exportToExcel}
              >
                <Download size={16} />
              </Button>

            </div>

          </CardHeader>

          <CardContent className="p-0">

            <AttendanceTable
              days={data.days}
              users={filteredUsers}
            />

          </CardContent>

        </Card>
      )}

    </div>
  )
}