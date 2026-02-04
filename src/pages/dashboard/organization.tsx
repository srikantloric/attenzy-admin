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

function OrganizationDashboard() {

    const attendanceByDate = [
        { label: "Mon", value: 720 },
        { label: "Tue", value: 760 },
        { label: "Wed", value: 810 },
        { label: "Thu", value: 790 },
        { label: "Fri", value: 842 },
        { label: "Sat", value: 680 },
        { label: "Sun", value: 610 }
    ]

    const maxAttendance = 900
    const chartHeight = 180


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Orgnization Dashboard</h1>
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
                                                className="w-[80px] rounded-md bg-primary"
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

export default OrganizationDashboard