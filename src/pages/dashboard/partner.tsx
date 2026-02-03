import DeviceHealth from "@/components/DeviceHealth"
import StatCard from "@/components/StatCard"
import { AlertTriangle, Cpu, UserCheck, Users } from "lucide-react"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import LiveAttendance from "@/components/LiveAttendance"
import LiveAttendanceWithDevice from "@/components/LiveAttendanceWithDevice"

function PartnerDashboard() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Partner Dashboard</h1>
                <Button variant="secondary">Today</Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <StatCard
                    title="Students Present"
                    value="842"
                    trend="+2.4%"
                    icon={<Users />}
                />
                <StatCard
                    title="Faculty Present"
                    value="48 / 52"
                    trend="+1.1%"
                    icon={<UserCheck />}
                />
                <StatCard
                    title="Active Devices"
                    value="18 / 20"
                    trend="2 offline"
                    icon={<Cpu />}
                    negative
                />
                <StatCard
                    title="Attendance Errors"
                    value="6"
                    trend="-12%"
                    icon={<AlertTriangle />}
                    warning
                />
            </div>

            {/* Chart + Device Health */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Daily Attendance Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-55 flex items-end gap-2">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-full rounded bg-primary/60"
                                    style={{ height: `${40 + Math.random() * 140}px` }}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <LiveAttendance />
            </div>
            {/* Live Attendance */}
            <div className="grid gap-4 md:grid-cols-3">
                <LiveAttendanceWithDevice />
                <DeviceHealth />
            </div>
        </div>
    )
}

export default PartnerDashboard