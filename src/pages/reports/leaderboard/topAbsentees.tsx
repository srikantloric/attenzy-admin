import { useState, useMemo, useEffect } from "react"
import { format } from "date-fns"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

import useAuth from "@/hooks/useAuth"
import { getTopAbsentees } from "@/api/reports/leaderboard/topAbsentees"
import type { TopAbsentee } from "@/types/reports/leaderboard/topAbsentees"

import { listGrades } from "@/api/academics"
import type { AcademicItem } from "@/types/academics"

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

import { Download } from "lucide-react"

export default function TopAbsentees() {
    const { user } = useAuth()
    const orgId = user?.orgId ?? ""

    const currentDate = new Date()

    /* ================= STATE ================= */

    const [periodType, setPeriodType] = useState<
        "MONTH" | "WEEK" | "RANGE" | "CLASS"
    >("MONTH")

    const [month, setMonth] = useState(format(currentDate, "MM"))
    const [year, setYear] = useState(format(currentDate, "yyyy"))
    const [week, setWeek] = useState(format(currentDate, "yyyy-'W'II"))

    const [startMonth, setStartMonth] = useState("01")
    const [endMonth, setEndMonth] = useState("03")

    const [classId, setClassId] = useState("")
    const [grades, setGrades] = useState<AcademicItem[]>([])

    const [data, setData] = useState<TopAbsentee[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("")
    const [error, setError] = useState("")

    /* ================= FETCH CLASSES ================= */

    useEffect(() => {
        if (!orgId) return

        const fetchGrades = async () => {
            try {
                const res = await listGrades(orgId)
                setGrades(res)
            } catch (err) {
                console.error(err)
            }
        }

        fetchGrades()
    }, [orgId])

    /* ================= RESET ================= */

    useEffect(() => {
        setData([])
        setError("")
    }, [periodType])

    /* ================= FETCH ================= */

    const handleGenerate = async () => {
        if (!orgId) return

        setLoading(true)
        setError("")

        try {
            let response

            /* MONTH */
            if (periodType === "MONTH") {
                response = await getTopAbsentees(orgId, "MONTH", {
                    month: `${year}-${month}`,
                })
            }

            /* WEEK */
            else if (periodType === "WEEK") {
                response = await getTopAbsentees(orgId, "WEEK", { week })
            }

            /* RANGE */
            else if (periodType === "RANGE") {
                const start = `${year}-${startMonth}`
                const end = `${year}-${endMonth}`

                if (start > end) {
                    setError("Invalid range")
                    setLoading(false)
                    return
                }

                response = await getTopAbsentees(orgId, "RANGE", {
                    startMonth: start,
                    endMonth: end,
                })
            }

            /* CLASS (NEW) */
            else if (periodType === "CLASS") {
                if (!classId) {
                    setError("Please select a class")
                    setLoading(false)
                    return
                }

                response = await getTopAbsentees(orgId, "MONTH", {
                    month: `${year}-${month}`,
                    classId,
                })
            }

            setData(response?.data || [])

        } catch (err) {
            console.error(err)
            setError("Failed to fetch data")
            setData([])
        } finally {
            setLoading(false)
        }
    }

    /* ================= SEARCH ================= */

    const filteredData = useMemo(() => {
        return data.filter((s) =>
            s.name.toLowerCase().includes(search.toLowerCase())
        )
    }, [data, search])

    const months = [
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

    /* ================= EXCEL ================= */

    const exportToExcel = () => {
        const sheetData: (string | number)[][] = [
            ["Rank", "Name", "Absent", "Attendance %", "Absence %"],
        ]

        filteredData.forEach((s) => {
            sheetData.push([
                s.rank,
                s.name,
                s.absent,
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
                    <div className="flex flex-wrap items-center gap-4 bg-muted/30 p-4 rounded-lg border">

                        {/* PERIOD */}
                        <Select value={periodType} onValueChange={(v) => setPeriodType(v as any)}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MONTH">Monthly</SelectItem>
                                <SelectItem value="WEEK">Weekly</SelectItem>
                                <SelectItem value="RANGE">Range</SelectItem>
                                <SelectItem value="CLASS">Class</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* CLASS */}
                        {periodType === "CLASS" && (
                            <Select value={classId} onValueChange={setClassId}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {grades.map((g) => (
                                        <SelectItem key={g.gradeId} value={g.name}>
                                            {g.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {/* MONTH */}
                        {(periodType === "MONTH" || periodType === "CLASS") && (
                            <>
                                <Select value={month} onValueChange={setMonth}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map((m) => (
                                            <SelectItem key={m.value} value={m.value}>
                                                {m.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={year} onValueChange={setYear}>
                                    <SelectTrigger className="w-[110px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["2026", "2025", "2024", "2023"].map((y) => (
                                            <SelectItem key={y} value={y}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </>
                        )}

                        {/* WEEK */}
                        {periodType === "WEEK" && (
                            <Input
                                type="week"
                                className="w-[180px]"
                                value={week}
                                onChange={(e) => setWeek(e.target.value)}
                            />
                        )}

                        {/* RANGE */}
                        {periodType === "RANGE" && (
                            <>
                                <Select value={startMonth} onValueChange={setStartMonth}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="From" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map((m) => (
                                            <SelectItem key={m.value} value={m.value}>
                                                {m.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={endMonth} onValueChange={setEndMonth}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="To" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map((m) => (
                                            <SelectItem key={m.value} value={m.value}>
                                                {m.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={year} onValueChange={setYear}>
                                    <SelectTrigger className="w-[110px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["2026", "2025", "2024", "2023"].map((y) => (
                                            <SelectItem key={y} value={y}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </>
                        )}

                        {/* BUTTON */}
                        <div className="ml-auto">
                            <Button onClick={handleGenerate}>
                                {loading ? "Generating..." : "Generate"}
                            </Button>
                        </div>

                    </div>

                    {error && (
                        <p className="text-sm text-red-500 mt-3">{error}</p>
                    )}
                </CardContent>
            </Card>

            {/* STATS */}
            {data.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Total Students</p>
                            <p className="text-2xl font-bold">{data.length}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Avg Absence</p>
                            <p className="text-2xl font-bold text-red-500">
                                {Math.round(
                                    data.reduce((acc, s) => acc + s.absencePercentage, 0) /
                                    data.length
                                )}%
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Worst Case</p>
                            <p className="font-semibold">{data[0]?.name}</p>
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
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-sm">

                                {/* HEADER */}
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="p-3 text-left">Rank</th>
                                        <th className="p-3 text-left">Name</th>
                                        <th className="p-3 text-center">Days</th>
                                        <th className="p-3 text-center">Present</th>
                                        <th className="p-3 text-center">Absent</th>
                                        <th className="p-3 text-center">Leave</th>
                                        <th className="p-3 text-center">Attendance %</th>
                                        <th className="p-3 text-center">Absence %</th>
                                    </tr>
                                </thead>

                                {/* BODY */}
                                <tbody>
                                    {filteredData.map((s) => (
                                        <tr
                                            key={s.userId}
                                            className="border-b hover:bg-muted/40 transition"
                                        >
                                            {/* Rank */}
                                            <td className="p-3 font-semibold">#{s.rank}</td>

                                            {/* Name */}
                                            <td className="p-3">{s.name}</td>

                                            {/* Total Days */}
                                            <td className="p-3 text-center">
                                                {s.totalWorkingDays}
                                            </td>

                                            {/* Present */}
                                            <td className="p-3 text-center text-green-600 font-medium">
                                                {s.present}
                                            </td>

                                            {/* Absent */}
                                            <td className="p-3 text-center text-red-500 font-medium">
                                                {s.absent}
                                            </td>

                                            {/* Leave */}
                                            <td className="p-3 text-center">
                                                {s.leave}
                                            </td>



                                            {/* Attendance % */}
                                            <td className="p-3 text-center">
                                                <span className="text-green-600 font-medium">
                                                    {s.attendancePercentage}%
                                                </span>
                                            </td>

                                            {/* Absence % */}
                                            <td className="p-3 text-center">
                                                <span className="text-red-600 font-semibold">
                                                    {s.absencePercentage}%
                                                </span>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    </CardContent>

                </Card>
            )}

            {/* EMPTY */}
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