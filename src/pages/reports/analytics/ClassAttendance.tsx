import { useState, useMemo } from "react"
import { format } from "date-fns"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

import useAuth from "@/hooks/useAuth"
import { getCalendarView } from "@/api/reports/studentAttendance"
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
import AttendanceGraph from "@/components/attendance/AttendanceGraph"

export default function ClassAttendance() {
    const { user } = useAuth()
    const orgId = user?.orgId ?? ""

    const [selectedClass, setSelectedClass] = useState("")
    const [selectedMonth, setSelectedMonth] = useState(
        format(new Date(), "yyyy-MM")
    )
    const [data, setData] = useState<AttendanceCalendarResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("")

    const monthOptions = Array.from({ length: 12 }).map((_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        return format(date, "yyyy-MM")
    })

    /* ================= FETCH ================= */

    const handleGenerate = async () => {
        if (!orgId || !selectedClass) return

        setLoading(true)
        try {
            const res = await getCalendarView(
                orgId,
                selectedMonth,
                selectedClass
            )
            setData(res)
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
        XLSX.utils.book_append_sheet(workbook, worksheet, "Class Attendance")

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        })

        const blob = new Blob([excelBuffer], {
            type: "application/octet-stream",
        })

        saveAs(
            blob,
            `Class-${selectedClass}-Attendance-${selectedMonth}.xlsx`
        )
    }

    return (
        <div className="w-full px-4 py-6 space-y-6">

            {/* FILTER CARD */}
            <Card>
                <CardHeader>
                    <CardTitle>Class Attendance Register</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-wrap gap-4 items-center">

                    {/* Class Select */}
                    <Select
                        value={selectedClass}
                        onValueChange={setSelectedClass}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LKG">LKG</SelectItem>
                            <SelectItem value="UKG">UKG</SelectItem>
                            <SelectItem value="1-A">1-A</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Month Select */}
                    <Select
                        value={selectedMonth}
                        onValueChange={setSelectedMonth}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {monthOptions.map((month) => (
                                <SelectItem key={month} value={month}>
                                    {month}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button onClick={handleGenerate}>
                        {loading ? "Generating..." : "Generate"}
                    </Button>

                    {data && (
                        <>
                            <Button variant="outline" onClick={exportToExcel}>
                                Excel
                            </Button>

                            <Input
                                placeholder="Search student..."
                                className="w-52"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </>
                    )}
                </CardContent>
            </Card>

            {/* TABLE */}
            {data && (
                <AttendanceTable
                    days={data.days}
                    users={filteredUsers}
                />
            )}

            {/* GRAPH */}
            {data && (
                <Card>
                    <CardHeader>
                        <CardTitle>Attendance Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                        <AttendanceGraph
                            days={data.days}
                            users={filteredUsers}
                        />
                    </CardContent>
                </Card>
            )}

        </div>
    )
}