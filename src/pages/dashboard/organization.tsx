import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { AlertTriangle, Cpu, UserCheck, Users } from "lucide-react"

import DeviceHealth from "@/components/DeviceHealth"
import StatCard from "@/components/StatCard"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import LiveAttendance from "@/components/LiveAttendance"
import LiveAttendanceWithDevice from "@/components/LiveAttendanceWithDevice"
import { AppBreadcrumb } from "@/components/AppBreadCrumb"

import useAuth from "@/hooks/useAuth"
import { getAttendanceByOrg } from "@/api/attendance"
import { listOrgDevices } from "@/api/device"
import { getUsersByOrg } from "@/api/users"

import type { AttendanceItem } from "@/types/attendance"
import type { Device } from "@/types/device"
import type { User } from "@/types/users"

function OrganizationDashboard() {
    const { user } = useAuth()
    const orgId = user?.orgId

    const [attendance, setAttendance] = useState<AttendanceItem[]>([])
    const [devices, setDevices] = useState<Device[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!orgId) return

        const loadDashboard = async () => {
            try {
                setLoading(true)
                setError(null)

                const [attendanceRes, devicesRes, usersRes] = await Promise.all([
                    getAttendanceByOrg(orgId),
                    listOrgDevices(orgId),
                    getUsersByOrg(orgId),
                ])

                setAttendance(attendanceRes ?? [])
                setDevices(devicesRes.items ?? [])
                setUsers(usersRes ?? [])
            } catch (err) {
                console.error(err)
                setError("Failed to load dashboard data")
            } finally {
                setLoading(false)
            }
        }

        loadDashboard()
    }, [orgId])

    const todayKey = format(new Date(), "yyyy-MM-dd")

    const getDateKeyFromTimestamp = (timestamp: number) =>
        format(new Date(timestamp), "yyyy-MM-dd")

    const todayAttendance = useMemo(
        () => attendance.filter((item) => getDateKeyFromTimestamp(item.timestamp) === todayKey),
        [attendance, todayKey]
    )

    const attendanceCountByDate = useMemo(() => {
        return attendance.reduce((map, item) => {
            const key = getDateKeyFromTimestamp(item.timestamp)
            map.set(key, (map.get(key) ?? 0) + 1)
            return map
        }, new Map<string, number>())
    }, [attendance])

    const attendanceByDate = useMemo(() => {
        return Array.from({ length: 7 }).map((_, index) => {
            const date = new Date()
            date.setDate(date.getDate() - (6 - index))
            const key = format(date, "yyyy-MM-dd")

            return {
                label: format(date, "EEE"),
                value: attendanceCountByDate.get(key) ?? 0,
            }
        })
    }, [attendanceCountByDate])

    const maxAttendance = Math.max(...attendanceByDate.map((item) => item.value), 1)
    const chartHeight = 180

    const latestAttendance = useMemo(
        () => [...todayAttendance].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5),
        [todayAttendance]
    )

    const activeDevices = useMemo(
        () => devices.filter((device) => device.status === "ONLINE" || device.status === "IDLE"),
        [devices]
    )

    const todayStudentCount = useMemo(() => {
        const studentIds = new Set(
            todayAttendance
                .filter((item) => item.userType === "STUDENT")
                .map((item) => item.userId)
        )

        return studentIds.size
    }, [todayAttendance])

    const todayFacultyCount = useMemo(() => {
        const facultyIds = new Set(
            todayAttendance
                .filter((item) => item.userType === "FACULTY")
                .map((item) => item.userId)
        )

        return facultyIds.size
    }, [todayAttendance])

    const totalStudents = useMemo(
        () => users.filter((item) => item.userType === "STUDENT").length,
        [users]
    )

    const totalFaculty = useMemo(
        () => users.filter((item) => item.userType === "FACULTY").length,
        [users]
    )

    const attendanceErrors = useMemo(
        () => todayAttendance.filter((item) => !item.deviceId || !item.deviceName || !item.rfidCode).length,
        [todayAttendance]
    )

    if (!orgId) {
        return (
            <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
                Organization information not available. Please login again.
            </div>
        )
    }

    if (loading) {
        return (
            <div className="space-y-6 p-2 lg:p-6 md:p-3">
                <AppBreadcrumb />
                <div className="text-sm text-muted-foreground">Loading dashboard...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6 p-2 lg:p-6 md:p-3">
                <AppBreadcrumb />
                <div className="text-sm text-red-600">{error}</div>
            </div>
        )
    }


    return (
        <div className="space-y-6 p-2 lg:p-6 md:p-3">
            <AppBreadcrumb />

            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Orgnization Dashboard</h1>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <StatCard
                    title="Students Present"
                    value={`${todayStudentCount} / ${totalStudents}`}
                    trend="Today present"
                    icon={<Users />}
                />
                <StatCard
                    title="Faculty Present"
                    value={`${todayFacultyCount} / ${totalFaculty}`}
                    trend="Today present"
                    icon={<UserCheck />}
                />
                <StatCard
                    title="Active Devices"
                    value={`${activeDevices.length} / ${devices.length}`}
                    trend={`${Math.max(devices.length - activeDevices.length, 0)} offline`}
                    icon={<Cpu />}
                    negative={devices.length > activeDevices.length}
                />
                <StatCard
                    title="Attendance Errors"
                    value={attendanceErrors}
                    trend="Live scans"
                    icon={<AlertTriangle />}
                    warning={attendanceErrors > 0}
                />
            </div>

            {/* Chart + Device Health */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Daily Attendance Trend</CardTitle>
                    </CardHeader>
                    <CardContent>

                        <div className="flex h-64">
                            {/* Y-axis */}
                            <div className="flex flex-col justify-between text-xs text-muted-foreground pr-3">
                                {[70, 50, 30, 10, 0].map((value) => (
                                    <span key={value}>{value}</span>
                                ))}
                            </div>

                            {/* Chart Area */}
                            <div className="relative flex-1">
                                {/* Bars */}
                                <div className="absolute mb-2 inset-0 flex items-end gap-4">
                                    {attendanceByDate.map((item) => (
                                        <div key={item.label} className="flex flex-col items-center w-full">
                                            <div
                                                className="w-full rounded-md bg-primary"
                                                style={{
                                                    height: `${(item.value / maxAttendance) * chartHeight}px`
                                                }}
                                                title={`${item.value} organizations`}
                                            />

                                        </div>
                                    ))}
                                </div>

                                {/* X-axis */}
                                <div className="absolute mb-2 -bottom-6 left-0 right-0 flex justify-between text-xs text-muted-foreground">
                                    {attendanceByDate.map((item) => (
                                        <span key={item.label} className="w-full text-center">
                                            {item.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                <LiveAttendance records={latestAttendance} loading={loading} />
            </div>
            {/* Live Attendance */}
            <div className="grid gap-4 md:grid-cols-3">
                <LiveAttendanceWithDevice records={latestAttendance} loading={loading} />
                <DeviceHealth devices={devices} loading={loading} />
            </div>
        </div>
    )
}

export default OrganizationDashboard