import { useEffect, useMemo, useState } from "react"
import { Cpu, Building2, Activity } from "lucide-react"

import StatCard from "@/components/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

import useAuth from "@/hooks/useAuth"
import { getOrganizationsByPartner } from "@/api/organization"
import { getDevicesByPartner } from "@/api/device"

import type { OrganizationApi } from "@/types/organization"
import type { Device } from "@/types/device"

function PartnerDashboard() {
    const { user } = useAuth()
    const partnerId = user?.partnerId

    const [organizations, setOrganizations] = useState<OrganizationApi[]>([])
    const [devices, setDevices] = useState<Device[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    /* ================= FETCH DATA ================= */

    useEffect(() => {
        if (!partnerId) return

        const pid: string = partnerId

        async function loadDashboard() {
            try {
                setLoading(true)
                setError(null)

                const [orgRes, deviceRes] = await Promise.all([
                    getOrganizationsByPartner(pid),
                    getDevicesByPartner(pid)
                ])

                setOrganizations(orgRes.items ?? [])
                setDevices(deviceRes.items ?? [])
            } catch (err) {
                console.error(err)
                setError("Failed to load dashboard data")
            } finally {
                setLoading(false)
            }
        }

        loadDashboard()
    }, [partnerId])



    /* ================= STATS ================= */

    const totalOrganizations = organizations.length
    const totalDevices = devices.length

    const activeDevices = useMemo(
        () =>
            devices.filter(
                d => d.status === "ONLINE" || d.status === "IDLE"
            ).length,
        [devices]
    )

    const inactiveDevices = totalDevices - activeDevices

    /* ================= TABLE DATA ================= */

    const topOrganizations = useMemo(() => {
        return [...organizations]
            .sort((a, b) => b.deviceCount - a.deviceCount)
            .slice(0, 4)
    }, [organizations])

    const recentOrganizations = useMemo(() => {
        return [...organizations]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 4)
    }, [organizations])

    /* ================= GUARDS ================= */

    if (!partnerId) {
        return (
            <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
                Partner information not available. Please login again.
            </div>
        )
    }

    if (loading) {
        return (
            <div className="p-6 text-sm text-muted-foreground">
                Loading dashboard...
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6 text-sm text-red-600">
                {error}
            </div>
        )
    }

    /* ================= RENDER ================= */

    return (
        <div className="space-y-6">
            <AppBreadcrumb />

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Channel Partner</h1>
                <Button variant="secondary">Today</Button>
            </div>

            {/* STATS */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Total Organizations"
                    value={totalOrganizations}
                    trend="Registered"
                    icon={<Building2 />}
                />

                <StatCard
                    title="Total Devices"
                    value={totalDevices}
                    trend="Provisioned"
                    icon={<Cpu />}
                />

                <StatCard
                    title="Active Devices"
                    value={`${activeDevices} / ${totalDevices}`}
                    trend={`${inactiveDevices} inactive`}
                    icon={<Activity />}
                    negative={inactiveDevices > 0}
                />
            </div>

            {/* TABLES */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* TOP ORGANIZATIONS */}
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
                                {topOrganizations.map(org => (
                                    <TableRow key={org.orgId}>
                                        <TableCell className="font-medium">
                                            {org.orgName}
                                        </TableCell>
                                        <TableCell>{org.deviceCount}</TableCell>
                                        <TableCell>
                                            {new Date(org.createdAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* RECENT ORGANIZATIONS */}
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
                                {recentOrganizations.map(org => (
                                    <TableRow key={org.orgId}>
                                        <TableCell className="font-medium">
                                            {org.orgName}
                                        </TableCell>
                                        <TableCell>{org.deviceCount}</TableCell>
                                        <TableCell>
                                            {new Date(org.createdAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* DEVICE HEALTH OVERVIEW */}
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
                                <TableHead>Serial No</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {devices.slice(0, 4).map(device => (
                                <TableRow key={device.deviceId}>
                                    <TableCell className="font-medium">
                                        {device.orgName}
                                    </TableCell>
                                    <TableCell>{device.location || "-"}</TableCell>
                                    <TableCell>{device.serialNumber}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={
                                                device.status === "ONLINE"
                                                    ? "border-green-500 text-green-600 bg-green-50"
                                                    : device.status === "IDLE"
                                                        ? "border-yellow-500 text-yellow-700 bg-yellow-50"
                                                        : "border-red-500 text-red-600 bg-red-50"
                                            }
                                        >
                                            {device.status}
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
