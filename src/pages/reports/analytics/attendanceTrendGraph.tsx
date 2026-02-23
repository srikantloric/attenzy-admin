import { useState, useEffect, useMemo } from "react"
import { format } from "date-fns"
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from "recharts"

import useAuth from "@/hooks/useAuth"
import { getFacultyCalendarView } from "@/api/reports/facultyAttendance"
import { getStaffCalendarView } from "@/api/reports/staffAttendance"
import { getCalendarView } from "@/api/reports/studentAttendance"

import type { AttendanceCalendarResponse } from "@/types/reports/attendance"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function AttendanceTrendGraph() {
    const { user } = useAuth()
    const orgId = user?.orgId ?? ""

    const [userType, setUserType] = useState<"STUDENT" | "FACULTY" | "STAFF">("STUDENT")
    const [viewMode, setViewMode] = useState<"DAILY" | "MONTHLY">("DAILY")
    const [selectedMonth, setSelectedMonth] = useState(
        format(new Date(), "yyyy-MM")
    )

    const [data, setData] = useState<AttendanceCalendarResponse | null>(null)
    const [loading, setLoading] = useState(false)

    const monthOptions = Array.from({ length: 12 }).map((_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        return format(date, "yyyy-MM")
    })

    /* ================= FETCH DATA ================= */

    useEffect(() => {
        if (!orgId) return

        const fetchData = async () => {
            setLoading(true)
            try {
                let res: AttendanceCalendarResponse | null = null

                if (userType === "FACULTY") {
                    res = await getFacultyCalendarView(orgId, selectedMonth)
                } else if (userType === "STAFF") {
                    res = await getStaffCalendarView(orgId, selectedMonth)
                } else {
                    // STUDENT (no class filter for trend overview)
                    res = await getCalendarView(orgId, selectedMonth, "")
                }

                setData(res)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [orgId, userType, selectedMonth])

    /* ================= GRAPH DATA ================= */

    const graphData = useMemo(() => {
        if (!data) return []

        // DAILY TREND
        if (viewMode === "DAILY") {
            return data.days.map((day) => {
                let presentCount = 0

                data.users.forEach((user) => {
                    if (user.attendance?.[day] === "PRESENT") {
                        presentCount++
                    }
                })

                return {
                    label: day,
                    present: presentCount,
                }
            })
        }

        // MONTHLY TREND (aggregate summary)
        const totalPresent = data.users.reduce(
            (acc, user) => acc + user.summary.present,
            0
        )

        const totalWorking = data.users.reduce(
            (acc, user) => acc + user.summary.workingDays,
            0
        )

        return [
            {
                label: selectedMonth,
                present: totalPresent,
                working: totalWorking,
            },
        ]
    }, [data, viewMode, selectedMonth])

    return (
        <div className="w-full px-4 py-6 space-y-6">

            {/* FILTER CARD */}
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Trend Analytics</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-wrap gap-4 items-center">

                    {/* User Type */}
                    <Select
                        value={userType}
                        onValueChange={(v: any) => setUserType(v)}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="STUDENT">Student</SelectItem>
                            <SelectItem value="FACULTY">Faculty</SelectItem>
                            <SelectItem value="STAFF">Staff</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* View Mode */}
                    <Select
                        value={viewMode}
                        onValueChange={(v: any) => setViewMode(v)}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DAILY">Daily</SelectItem>
                            <SelectItem value="MONTHLY">Monthly</SelectItem>
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

                </CardContent>
            </Card>

            {/* GRAPH */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {viewMode} Attendance Trend - {userType}
                    </CardTitle>
                </CardHeader>

                <CardContent className="h-96">

                    {loading ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Loading graph...
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">

                            {viewMode === "DAILY" ? (

                                <LineChart data={graphData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="present"
                                        stroke="#16a34a"
                                        strokeWidth={2}
                                    />
                                </LineChart>

                            ) : (

                                <BarChart data={graphData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar
                                        dataKey="present"
                                        fill="#16a34a"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="working"
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>

                            )}

                        </ResponsiveContainer>
                    )}

                </CardContent>
            </Card>

        </div>
    )
}