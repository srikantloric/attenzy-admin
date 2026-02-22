import { useState, useMemo } from "react"
import { format } from "date-fns"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts"

import useAuth from "@/hooks/useAuth"
import { getCalendarView } from "@/api/reports/studentAttendance"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

export default function ClassAttendance() {
    const { user } = useAuth()
    const orgId = user?.orgId ?? ""

    const [selectedClass, setSelectedClass] = useState("")
    const [selectedMonth, setSelectedMonth] = useState(
        format(new Date(), "yyyy-MM")
    )
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("")

    const monthOptions = Array.from({ length: 12 }).map((_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        return format(date, "yyyy-MM")
    })

    const handleGenerate = async () => {
        if (!orgId || !selectedClass) return
        setLoading(true)

        const res = await getCalendarView(
            orgId,
            selectedMonth,
            selectedClass
        )

        setData(res)
        setLoading(false)
    }

    /* ================= SEARCH FILTER ================= */

    const filteredUsers = useMemo(() => {
        if (!data) return []
        return data.users.filter((u: any) =>
            u.name.toLowerCase().includes(search.toLowerCase())
        )
    }, [data, search])

    /* ================= BADGE ================= */

    const getBadge = (status?: string) => {
        let display = "-"
        if (status === "PRESENT") display = "P"
        if (status === "ABSENT") display = "A"
        if (status === "LEAVE") display = "L"

        return (
            <span
                className={`inline-flex items-center justify-center 
          h-6 w-6 rounded-md text-xs font-semibold
          ${display === "P"
                        ? "bg-green-100 text-green-700"
                        : display === "A"
                            ? "bg-red-100 text-red-700"
                            : display === "L"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-muted text-muted-foreground"
                    }`}
            >
                {display}
            </span>
        )
    }

    /* ================= EXCEL ================= */

    const exportToExcel = () => {
        if (!data) return

        const sheetData: any[] = []
        const header = ["Name", ...data.days, "P/W", "%"]
        sheetData.push(header)

        filteredUsers.forEach((user: any) => {
            const row = [user.name]

            data.days.forEach((day: string) => {
                const status = user.attendance?.[day]
                row.push(status ? status[0] : "-")
            })

            row.push(
                `${user.summary.present}/${user.summary.workingDays}`
            )
            row.push(user.summary.attendancePercentage)

            sheetData.push(row)
        })

        const worksheet = XLSX.utils.aoa_to_sheet(sheetData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance")

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        })

        const blob = new Blob([excelBuffer], {
            type: "application/octet-stream",
        })

        saveAs(blob, `Attendance-${selectedMonth}.xlsx`)
    }

    /* ================= PDF EXPORT ================= */

    const exportToPDF = async () => {
        const input = document.getElementById("print-area")
        if (!input) return

        const canvas = await html2canvas(input)
        const imgData = canvas.toDataURL("image/png")

        const pdf = new jsPDF("l", "mm", "a4")
        pdf.addImage(imgData, "PNG", 10, 10, 280, 180)
        pdf.save(`Attendance-${selectedMonth}.pdf`)
    }

    /* ================= GRAPH DATA ================= */

    const trendData = useMemo(() => {
        if (!data) return []

        return data.days.map((day: string) => {
            let presentCount = 0
            filteredUsers.forEach((user: any) => {
                if (user.attendance?.[day] === "PRESENT")
                    presentCount++
            })

            return {
                day,
                present: presentCount,
            }
        })
    }, [data, filteredUsers])

    return (
        <div className="w-full px-4 py-6 space-y-6">

            {/* FILTER CARD */}
            <Card>
                <CardHeader>
                    <CardTitle>Class Attendance Register</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-wrap gap-4 items-center">

                    {/* Class */}
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

                    {/* Month */}
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

                            {/* <Button variant="outline" onClick={exportToPDF}>
                                PDF
                            </Button> */}
                        </>
                    )}

                    {data && (
                        <Input
                            placeholder="Search student..."
                            className="w-52"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    )}

                </CardContent>
            </Card>

            {/* TABLE */}
            {data && (
                <Card>
                    <CardContent>
                        <div
                            id="print-area"
                            className="w-full max-w-full overflow-x-auto rounded-lg border"
                        >
                            <Table className="w-full text-xs sm:text-sm">

                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="sticky left-0 z-30 bg-background border-r min-w-[180px]">
                                            Name
                                        </TableHead>

                                        {data.days.map((day: string) => (
                                            <TableHead
                                                key={day}
                                                className="text-center min-w-[40px]"
                                            >
                                                {day}
                                            </TableHead>
                                        ))}

                                        <TableHead>P/W</TableHead>
                                        <TableHead>%</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {filteredUsers.map((user: any) => (
                                        <TableRow key={user.userId}>

                                            <TableCell className="flex gap-2 items-center sticky left-0 z-20 bg-background border-r font-medium min-w-[180px]">
                                                <Avatar>
                                                    <AvatarImage
                                                        src="https://github.com/shadcn.png"
                                                        alt="@shadcn"
                                                    >

                                                    </AvatarImage>
                                                    <AvatarFallback>CN</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col items-start">
                                                    <p className="font-bold">
                                                        {user.name.toUpperCase()}
                                                    </p>
                                                    <Button
                                                        variant={"link"}
                                                        className="p-0 text-xs m-0 text-gray-500 h-5"
                                                    >
                                                        {user.userId}
                                                    </Button>
                                                </div>
                                            </TableCell>


                                            {data.days.map((day: string) => (
                                                <TableCell key={day} className="text-center">
                                                    {getBadge(user.attendance?.[day])}
                                                </TableCell>
                                            ))}

                                            <TableCell className="text-center font-semibold">
                                                {user.summary.present}/
                                                {user.summary.workingDays}
                                            </TableCell>

                                            <TableCell className="text-center font-semibold">
                                                {user.summary.attendancePercentage}%
                                            </TableCell>

                                        </TableRow>
                                    ))}
                                </TableBody>

                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* GRAPH */}
            {data && (
                <Card>
                    <CardHeader>
                        <CardTitle>Attendance Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="present"
                                    stroke="#16a34a"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

        </div>
    )
}