import { Cpu, Building2, Activity } from "lucide-react"

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
import { AppBreadcrumb } from "@/components/AppBreadCrumb"

function PartnerDashboard() {
    return (
        <div className="space-y-6">
            <AppBreadcrumb />

            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Channel Partner</h1>
                <Button variant="secondary">Today</Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Total Organizations"
                    value="18"
                    trend="+2 this month"
                    icon={<Building2 />}
                />

                <StatCard
                    title="Total Devices"
                    value="123"
                    trend="+24 added"
                    icon={<Cpu />}
                />

                <StatCard
                    title="Active Devices"
                    value="118 / 123"
                    trend="5 offline"
                    icon={<Activity />}
                    negative
                />
            </div>

            {/* Tables */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Top Organizations */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Organizations by Devices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Devices</TableHead>
                                    <TableHead>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[
                                    ["Unified Tech", 53, "2023-04-25"],
                                    ["Connect Solutions", 45, "2024-01-12"],
                                    ["EduSmart Technologies", 37, "2023-08-09"],
                                    ["Trackify Systems", 15, "2024-04-09"]
                                ].map(([name, devices, date]) => (
                                    <TableRow key={name as string}>
                                        <TableCell className="font-medium">{name}</TableCell>
                                        <TableCell>{devices}</TableCell>
                                        <TableCell>{date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Recent Organizations */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Organizations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Devices</TableHead>
                                    <TableHead>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[
                                    ["Main Gate", 59, "2024-01-29"],
                                    ["Admin Building", 45, "2024-01-12"],
                                    ["Oakwood Academy", 28, "2023-08-05"],
                                    ["Trackify Systems", 15, "2024-04-09"]
                                ].map(([name, devices, date]) => (
                                    <TableRow key={name as string}>
                                        <TableCell className="font-medium">{name}</TableCell>
                                        <TableCell>{devices}</TableCell>
                                        <TableCell>{date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Device Health Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Device Health Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Organization</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Devices</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[
                                ["Greenfield High School", "Main Gate", 59, "Active"],
                                ["Connect Solutions", "Admin Building", 45, "Active"],
                                ["EduSmart Technologies", "Learning Center", 37, "Active"],
                                ["Trackify Systems", "-", 15, "Inactive"]
                            ].map(([org, location, devices, status]) => (
                                <TableRow key={org as string}>
                                    <TableCell className="font-medium">{org}</TableCell>
                                    <TableCell>{location}</TableCell>
                                    <TableCell>{devices}</TableCell>
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
    )
}

export default PartnerDashboard
