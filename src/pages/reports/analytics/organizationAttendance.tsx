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

export default function OrganizationAttendance() {
    const { user } = useAuth()
    const orgId = user?.orgId ?? ""

    const [selectedMonth, setSelectedMonth] = useState(
        format(new Date(), "yyyy-MM")
    )
    const [viewMode, setViewMode] = useState<"DAILY" | "MONTHLY">("DAILY")

    const [data, setData] = useState<AttendanceCalendarResponse | null>(null)
    const [loading, setLoading] = useState(false)

    const monthOptions = Array.from({ length: 12 }).map((_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        return format(date, "yyyy-MM")
    })

    /* ================= FETCH ORG STUDENT DATA ================= */

    useEffect(() => {
        if (!orgId) return

        const fetchData = async () => {
            setLoading(true)
            try {
                // Passing empty classId to fetch all students
                const res = await getCalendarView(orgId, selectedMonth, "")
                setData(res)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [orgId, selectedMonth])

    /* ================= GRAPH DATA ================= */

    const graphData = useMemo(() => {
        if (!data) return []

        // DAILY TREND
        if (viewMode === "DAILY") {
            return data.days.map((day) => {
                let presentCount = 0
                let absentCount = 0

                data.users.forEach((user) => {
                    const status = user.attendance?.[day]

                    if (status === "PRESENT") presentCount++
                    if (status === "ABSENT") absentCount++
                })

                return {
                    label: day,
                    present: presentCount,
                    absent: absentCount,
                }
            })
        }

        // MONTHLY TREND (aggregate)
        const totalPresent = data.users.reduce(
            (acc, user) => acc + user.summary.present,
            0
        )

        const totalAbsent = data.users.reduce(
            (acc, user) => acc + user.summary.absent,
            0
        )

        return [
            {
                label: selectedMonth,
                present: totalPresent,
                absent: totalAbsent,
            },
        ]
    }, [data, viewMode, selectedMonth])

    return (
        <div className="w-full px-4 py-6 space-y-6">

            {/* FILTER CARD */}
            <Card>
                <CardHeader>
                    <CardTitle>Organization Student Attendance</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-wrap gap-4 items-center">

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

            {/* GRAPH CARD */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {viewMode} Attendance Trend - Organization
                    </CardTitle>
                </CardHeader>

                <CardContent className="h-96">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Loading organization trend...
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
                                    <Line
                                        type="monotone"
                                        dataKey="absent"
                                        stroke="#dc2626"
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
                                        dataKey="absent"
                                        fill="#dc2626"
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