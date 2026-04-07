import { useState, useMemo, useEffect } from "react"
import { format } from "date-fns"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

import useAuth from "@/hooks/useAuth"
import { getTopAbsentees } from "@/api/reports/leaderboard/topAbsentees"
import type { TopAbsentee } from "@/types/reports/leaderboard/topAbsentees"

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
import { Badge } from "@/components/ui/badge"

import { Download } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export default function TopAbsentees() {
    const { user } = useAuth()
    const orgId = user?.orgId ?? ""

    const currentDate = new Date()

    /* ================= STATE ================= */

    const [periodType, setPeriodType] = useState<"MONTH" | "WEEK" | "RANGE">("MONTH")

    const [month, setMonth] = useState(format(currentDate, "MM"))
    const [year, setYear] = useState(format(currentDate, "yyyy"))
    const [week, setWeek] = useState(format(currentDate, "yyyy-'W'II"))

    const [startMonth, setStartMonth] = useState(format(currentDate, "yyyy-MM"))
    const [endMonth, setEndMonth] = useState(format(currentDate, "yyyy-MM"))

    const [data, setData] = useState<TopAbsentee[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("")

    /* ================= RESET ================= */

    useEffect(() => {
        setData([])
    }, [periodType])

    /* ================= FETCH ================= */

    const handleGenerate = async () => {
        if (!orgId) return

        setLoading(true)

        try {
            let response

            if (periodType === "MONTH") {
                response = await getTopAbsentees(orgId, "MONTH", {
                    month: `${year}-${month}`,
                })
            } else if (periodType === "WEEK") {
                response = await getTopAbsentees(orgId, "WEEK", { week })
            } else {
                response = await getTopAbsentees(orgId, "RANGE", {
                    startMonth,
                    endMonth,
                })
            }

            setData(response?.data || [])
        } catch (err) {
            console.error(err)
            setData([])
        } finally {
            setLoading(false)
        }
    }

    /* ================= FILTER ================= */

    const filteredData = useMemo(() => {
        return data.filter((s) =>
            s.name.toLowerCase().includes(search.toLowerCase())
        )
    }, [data, search])

    /* ================= STATS ================= */

    const totalStudents = data.length

    const avgAbsence =
        data.length > 0
            ? Math.round(
                data.reduce((acc, s) => acc + s.absencePercentage, 0) / data.length
            )
            : 0

    const worstStudent = data[0]

    /* ================= EXCEL ================= */

    const exportToExcel = () => {
        const sheetData: (string | number)[][] = [
            [
                "Rank",
                "Name",
                "Present",
                "Absent",
                "Leave",
                "Days",
                "Attendance %",
                "Absence %",
            ],
        ]

        filteredData.forEach((s) => {
            sheetData.push([
                s.rank,
                s.name,
                s.present,
                s.absent,
                s.leave,
                s.totalWorkingDays,
                s.attendancePercentage,
                s.absencePercentage,
            ])
        })

        const ws = XLSX.utils.aoa_to_sheet(sheetData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Top Absentees")

        const blob = new Blob(
            [XLSX.write(wb, { bookType: "xlsx", type: "array" })],
            { type: "application/octet-stream" }
        )

        saveAs(blob, "Top-Absentees.xlsx")
    }

    /* ================= UI ================= */

    return (
        <div className="py-6 space-y-6">

            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Top Absentees
                </h1>
                <p className="text-sm text-muted-foreground">
                    Identify students with highest absentee rates
                </p>
            </div>

            {/* FILTER */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Absentees Report</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-wrap items-center gap-4">

                        {/* PERIOD */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Period</span>

                            <Select
                                value={periodType}
                                onValueChange={(val) => setPeriodType(val as any)}
                            >
                                <SelectTrigger className="w-36">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MONTH">Monthly</SelectItem>
                                    <SelectItem value="WEEK">Weekly</SelectItem>
                                    <SelectItem value="RANGE">Range</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* MONTHLY FILTER */}
                        {periodType === "MONTH" && (
                            <div className="flex items-center gap-2">

                                {/* MONTH */}
                                <Select value={month} onValueChange={setMonth}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="01">Jan</SelectItem>
                                        <SelectItem value="02">Feb</SelectItem>
                                        <SelectItem value="03">Mar</SelectItem>
                                        <SelectItem value="04">Apr</SelectItem>
                                        <SelectItem value="05">May</SelectItem>
                                        <SelectItem value="06">Jun</SelectItem>
                                        <SelectItem value="07">Jul</SelectItem>
                                        <SelectItem value="08">Aug</SelectItem>
                                        <SelectItem value="09">Sep</SelectItem>
                                        <SelectItem value="10">Oct</SelectItem>
                                        <SelectItem value="11">Nov</SelectItem>
                                        <SelectItem value="12">Dec</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* YEAR */}
                                <Select value={year} onValueChange={setYear}>
                                    <SelectTrigger className="w-[110px]">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 5 }).map((_, i) => {
                                            const y = (new Date().getFullYear() - i).toString()
                                            return (
                                                <SelectItem key={y} value={y}>
                                                    {y}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>

                            </div>
                        )}

                        {/* WEEKLY FILTER */}
                        {periodType === "WEEK" && (
                            <div className="flex items-center gap-2">

                                <Input
                                    type="week"
                                    className="w-[180px]"
                                    value={week}
                                    onChange={(e) => setWeek(e.target.value)}
                                />

                            </div>
                        )}

                        {/* RANGE FILTER (MONTH ONLY) */}
                        {periodType === "RANGE" && (
                            <div className="flex items-center gap-3">

                                {/* FROM */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">From</span>

                                    <Input
                                        type="month"
                                        className="w-[150px]"
                                        value={startMonth}
                                        onChange={(e) => setStartMonth(e.target.value)}
                                    />
                                </div>

                                {/* TO */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">To</span>

                                    <Input
                                        type="month"
                                        className="w-[150px]"
                                        value={endMonth}
                                        onChange={(e) => setEndMonth(e.target.value)}
                                    />
                                </div>

                            </div>
                        )}

                        {/* BUTTON */}
                        <div className="ml-auto">
                            <Button onClick={handleGenerate}>
                                {loading ? "Generating..." : "Generate"}
                            </Button>
                        </div>

                    </div>
                </CardContent>
            </Card>

            {/* STATS */}
            {data.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Total Students</p>
                            <p className="text-2xl font-bold">{totalStudents}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Avg Absence</p>
                            <p className="text-2xl font-bold text-red-500">
                                {avgAbsence}%
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Worst Case</p>
                            <p className="font-semibold">{worstStudent?.name}</p>
                            <Badge variant="destructive">
                                {worstStudent?.absencePercentage}%
                            </Badge>
                        </CardContent>
                    </Card>

                </div>
            )}

            {/* TABLE */}
            {data.length > 0 && (
                <Card>

                    <CardHeader className="flex flex-row items-center justify-between">

                        <CardTitle>Absentees List</CardTitle>

                        <div className="flex gap-3">
                            <Input
                                placeholder="Search..."
                                className="w-60"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            <Button variant="outline" size="icon" onClick={exportToExcel}>
                                <Download size={16} />
                            </Button>
                        </div>

                    </CardHeader>

                    <CardContent className="p-0">
                        <table className="w-full text-sm">

                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-3 text-left">Rank</th>
                                    <th className="p-3 text-left">Name</th>
                                    <th className="p-3 text-center">Absent</th>
                                    <th className="p-3 text-center">Attendance</th>
                                    <th className="p-3 text-center">Absence</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredData.map((s) => (
                                    <tr key={s.userId} className="border-b hover:bg-muted/40">
                                        <td className="p-3 font-semibold">#{s.rank}</td>
                                        <td className="p-3">{s.name}</td>
                                        <td className="p-3 text-center text-red-500">{s.absent}</td>

                                        <td className="p-3 text-center">
                                            <Badge variant="secondary">
                                                {s.attendancePercentage}%
                                            </Badge>
                                        </td>

                                        <td className="p-3 text-center">
                                            <Badge variant="destructive">
                                                {s.absencePercentage}%
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </CardContent>

                </Card>
            )}

            {!loading && data.length === 0 && (
                <Card>
                    <CardContent className="py-6 text-center text-muted-foreground">
                        No data available
                    </CardContent>
                </Card>
            )}

        </div>
    )
}