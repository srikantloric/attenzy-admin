import { useEffect, useMemo, useState } from "react"
import { Search, MoreVertical, Eye, Pencil, RotateCw } from "lucide-react"

import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import SignalBars from "@/components/SignalBars"
import { AppBreadcrumb } from "@/components/AppBreadCrumb"
import { listOrgDevices } from "@/api/device"
import type { Device, DeviceStatus } from "@/types/device"
import useAuth from "@/hooks/useAuth"
import {
    formatLastActivity, formatUptime, mapStatusToUi, rssiToBars,
} from "@/utils/device"
import DataPagination from "@/components/Pagination"

const statusBadge = (status: DeviceStatus) => {
    switch (status) {
        case "ONLINE":
            return "bg-green-100 text-green-700"
        case "IDLE":
            return "bg-yellow-100 text-yellow-700"
        case "OFFLINE":
            return "bg-red-100 text-red-700"
        case "INACTIVE":
            return "bg-gray-200 text-gray-700"
        default:
            return "bg-muted text-muted-foreground"
    }
}

const OrgDeviceHealth: React.FC = () => {
    const { user } = useAuth()
    const orgId = user?.orgId

    const [devices, setDevices] = useState<Device[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [search, setSearch] = useState("")
    const [filter, setFilter] =
        useState<"ALL" | "ONLINE" | "IDLE" | "OFFLINE" | "ALERTS">("ALL")

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    useEffect(() => {
        if (!orgId) return

        const fetchDevices = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await listOrgDevices(orgId)
                setDevices(res.items ?? [])
            } catch (err: any) {
                setError(err.message || "Failed to load device health")
            } finally {
                setLoading(false)
            }
        }

        fetchDevices()
    }, [orgId])

    const deviceHealthData = useMemo(() => {
        return devices.map((device) => {
            const uiStatus = mapStatusToUi(device.status)

            const signalBars =
                device.status === "ONLINE"
                    ? rssiToBars(device.wifi?.rssi)
                    : 0

            const alerts =
                device.status === "OFFLINE" ||
                    device.status === "INACTIVE" ||
                    device.status === "MAINTENANCE"
                    ? 1
                    : 0

            return { ...device, uiStatus, signalBars, alerts }
        })
    }, [devices])

    const filteredDevices = useMemo(() => {
        const q = search.trim().toLowerCase()

        return deviceHealthData.filter((device) => {
            const matchesSearch =
                !q ||
                device.deviceId.toLowerCase().includes(q) ||
                device.location.toLowerCase().includes(q)

            const matchesFilter =
                filter === "ALL"
                    ? true
                    : filter === "ALERTS"
                        ? device.alerts > 0
                        : device.uiStatus === filter

            return matchesSearch && matchesFilter
        })
    }, [deviceHealthData, search, filter])

    const paginatedDevices = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage
        const end = currentPage * rowsPerPage
        return filteredDevices.slice(start, end)
    }, [filteredDevices, currentPage, rowsPerPage])

    useEffect(() => {
        setCurrentPage(1)
    }, [search, filter])

    const totalDevices = deviceHealthData.length
    const onlineCount = deviceHealthData.filter(d => d.uiStatus === "ONLINE").length
    const idleCount = deviceHealthData.filter(d => d.uiStatus === "IDLE").length
    const offlineCount = deviceHealthData.filter(d => d.uiStatus === "OFFLINE").length

    if (!orgId) {
        return (
            <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
                Organization information not available. Please login again.
            </div>
        )
    }

    return (
        <div className="space-y-6 p-2 md:p-3 lg:p-5">
            <AppBreadcrumb />

            <h1 className="text-2xl font-semibold tracking-tight">
                Device Health
            </h1>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Total Devices" value={totalDevices} />
                <StatCard label="Online Devices" value={onlineCount} color="text-green-600" />
                <StatCard label="Offline Devices" value={offlineCount} color="text-red-500" />
                <StatCard label="Idle" value={idleCount} color="text-yellow-600" />
            </div>

            {/* FILTERS */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex flex-wrap gap-2">
                    <FilterBtn active={filter === "ALL"} onClick={() => setFilter("ALL")}>All</FilterBtn>

                    <FilterBtn active={filter === "ONLINE"} onClick={() => setFilter("ONLINE")}>
                        Online <Badge variant="secondary" className="ml-2">{onlineCount}</Badge>
                    </FilterBtn>

                    <FilterBtn active={filter === "IDLE"} onClick={() => setFilter("IDLE")}>
                        Idle <Badge className="ml-2 bg-yellow-100 text-yellow-700">{idleCount}</Badge>
                    </FilterBtn>

                    <FilterBtn active={filter === "OFFLINE"} onClick={() => setFilter("OFFLINE")}>
                        Offline <Badge variant="destructive" className="ml-2">{offlineCount}</Badge>
                    </FilterBtn>
                </div>

                <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-2">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="w-full pl-8"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                Location
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Main Entrance</DropdownMenuItem>
                            <DropdownMenuItem>Building A</DropdownMenuItem>
                            <DropdownMenuItem>Science Lab</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Separator />

            {/* TABLE */}
            <Card>
                <CardContent>
                    {loading && (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                            Loading device health...
                        </div>
                    )}

                    {!loading && error && (
                        <div className="py-10 text-center text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="w-full overflow-x-auto">
                            <Table className="min-w-187.5">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Signal</TableHead>
                                        <TableHead>Uptime</TableHead>
                                        <TableHead className="text-center">Last Activity</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {paginatedDevices.map((device) => (
                                        <TableRow key={device.deviceId}>
                                            <TableCell className="whitespace-nowrap">{device.deviceId}</TableCell>
                                            <TableCell className="whitespace-nowrap">{device.location}</TableCell>

                                            <TableCell>
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(device.status)}`}>
                                                    {device.status}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <SignalBars strength={device.signalBars} />
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                {formatUptime(device.uptime)}
                                            </TableCell>

                                            <TableCell className="text-center whitespace-nowrap text-muted-foreground">
                                                {formatLastActivity(device.updatedAt)}
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <RotateCw className="mr-2 h-4 w-4" />
                                                            Restart
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>

                <Separator />

                <div className="p-3">
                    <DataPagination
                        totalItems={filteredDevices.length}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        rowsPerPage={rowsPerPage}
                        setRowsPerPage={setRowsPerPage}
                    />
                </div>
            </Card>
        </div>
    )
}

export default OrgDeviceHealth

/* ================= SMALL COMPONENTS ================= */

function StatCard({
    label,
    value,
    color,
}: {
    label: string
    value: number
    color?: string
}) {
    return (
        <Card>
            <CardContent className="px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex flex-col leading-tight">
                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                        {label}
                    </p>
                    <p className={`text-lg sm:text-xl font-semibold ${color ?? ""}`}>
                        {value}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
function FilterBtn({ active, children, onClick }: any) {
    return (
        <Button size="sm" variant={active ? "default" : "outline"} onClick={onClick}>
            {children}
        </Button>
    )
}