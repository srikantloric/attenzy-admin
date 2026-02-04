import { Cpu, Building2, Users, Activity } from "lucide-react"

import StatCard from "@/components/StatCard"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

function PlatformDashboard() {

    const maxOrganizations = 70 
    const chartHeight = 180 // px

    const partnerMonthlyData = [
        { label: "Apr 03", value: 52 },
        { label: "May 06", value: 60 },
        { label: "Jun 10", value: 48 },
        { label: "Jul 11", value: 55 },
        { label: "Aug 15", value: 42 },
        { label: "Sep 16", value: 50 },
        { label: "Oct 17", value: 58 },
        { label: "Nov 23", value: 62 }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Platform Admin</h1>
                <Button variant="secondary">Today</Button>
            </div>

            {/* Top Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Total Partners"
                    value="8"
                    icon={<Users />}
                />

                <StatCard
                    title="Total Organizations"
                    value="54"
                    trend="+8 this month"
                    icon={<Building2 />}
                />

                <StatCard
                    title="Active Devices"
                    value="372 / 400"
                    trend="8 offline"
                    icon={<Cpu />}
                    negative
                />
            </div>

            {/* Chart + Recent Partners */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Chart */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Top Partners by Organizations</CardTitle>
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
                                    {partnerMonthlyData.map((item) => (
                                        <div key={item.label} className="flex flex-col items-center w-full">
                                            <div
                                                className="w-full rounded-md bg-primary"
                                                style={{
                                                    height: `${(item.value / maxOrganizations) * chartHeight}px`
                                                }}
                                                title={`${item.value} organizations`}
                                            />

                                        </div>
                                    ))}
                                </div>

                                {/* X-axis */}
                                <div className="absolute mb-2 -bottom-6 left-0 right-0 flex justify-between text-xs text-muted-foreground">
                                    {partnerMonthlyData.map((item) => (
                                        <span key={item.label} className="w-full text-center">
                                            {item.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>


                    </CardContent>
                </Card>

                {/* Recent Partners */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Partners</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Partner</TableHead>
                                    <TableHead>Orgs</TableHead>
                                    <TableHead>Join Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[
                                    ["Unified Tech", 53, "2023-04-23", "Active"],
                                    ["Connect Solutions", 45, "2024-01-12", "Active"],
                                    ["EduSmart Technologies", 37, "2023-06-09", "Active"],
                                    ["Trackify Systems", 15, "2024-04-09", "Inactive"]
                                ].map(([name, orgs, date, status]) => (
                                    <TableRow key={name as string}>
                                        <TableCell className="font-medium">{name}</TableCell>
                                        <TableCell>{orgs}</TableCell>
                                        <TableCell>{date}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    status === "Active"
                                                        ? "border-green-500 text-green-600 bg-green-50"
                                                        : "border-red-500 text-red-600 bg-red-50"
                                                }
                                            >
                                                {status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Tables */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Top Partners */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Partners</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {[
                            ["Connect Solutions", "Active"],
                            ["EduSmart Technologies", "Active"],
                            ["Trackify Systems", "Active"],
                            ["SafePass Services", "Inactive"]
                        ].map(([name, status]) => (
                            <div
                                key={name as string}
                                className="flex items-center justify-between py-2"
                            >
                                <span className="font-medium">{name}</span>
                                <Badge
                                    variant="outline"
                                    className={
                                        status === "Active"
                                            ? "border-green-500 text-green-600 bg-green-50"
                                            : "border-red-500 text-red-600 bg-red-50"
                                    }
                                >
                                    {status}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Recent Partners Compact */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Partners</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {[
                            ["Unified Tech", "Active"],
                            ["Connect Solutions", "Active"],
                            ["EduSmart Tech.", "Active"],
                            ["Trackify Systems", "Inactive"]
                        ].map(([name, status]) => (
                            <div
                                key={name as string}
                                className="flex items-center justify-between py-2"
                            >
                                <span>{name}</span>
                                <Badge
                                    variant="outline"
                                    className={
                                        status === "Active"
                                            ? "border-green-500 text-green-600 bg-green-50"
                                            : "border-red-500 text-red-600 bg-red-50"
                                    }
                                >
                                    {status}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Device Health */}
                <Card>
                    <CardHeader>
                        <CardTitle>Device Health Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Active</TableHead>
                                    <TableHead>Tickets</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[
                                    ["Main Gate", 43, 2],
                                    ["Admin Building", 28, 1],
                                    ["Library", 16, 0]
                                ].map(([loc, active, tickets]) => (
                                    <TableRow key={loc as string}>
                                        <TableCell>{loc}</TableCell>
                                        <TableCell>{active}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    tickets === 0
                                                        ? "border-green-500 text-green-600 bg-green-50"
                                                        : "border-amber-500 text-amber-600 bg-amber-50"
                                                }
                                            >
                                                {tickets}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default PlatformDashboard
