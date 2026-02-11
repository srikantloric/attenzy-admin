import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    MoreVertical,
    Eye,
    Pencil,
    RotateCw
} from "lucide-react"

import SignalBars from "@/components/SignalBars"
import { AppBreadcrumb } from "@/components/AppBreadCrumb"

import { listOrgDevices } from "@/api/device"
import type { Device } from "@/types/device"
import useAuth from "@/hooks/useAuth"
import { formatLastActivity, mapStatusToUi, rssiToBars } from "@/utils/device"
import { Pagination } from "@/components/ui/pagination"
import DataPagination from "@/components/Pagination"


const OrgDeviceHealth: React.FC = () => {
    const { user } = useAuth()
    const orgId = user?.orgId

    const [devices, setDevices] = useState<Device[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [search, setSearch] = useState("")
    const [filter, setFilter] =
        useState<"all" | "online" | "idle" | "offline" | "alerts">("all")

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

            return {
                ...device,
                uiStatus,
                signalBars,
                alerts,
            }
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
                filter === "all"
                    ? true
                    : filter === "alerts"
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
    const onlineCount = deviceHealthData.filter(d => d.uiStatus === "online").length
    const idleCount = deviceHealthData.filter(d => d.uiStatus === "idle").length
    const offlineCount = deviceHealthData.filter(d => d.uiStatus === "offline").length

    if (!orgId) {
        return (
            <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
                Organization information not available. Please login again.
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            <AppBreadcrumb />

            <h1 className="text-2xl font-semibold tracking-tight">
                Device Health
            </h1>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Total Devices</p>
                        <p className="text-2xl font-semibold">{totalDevices}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Online Devices</p>
                        <p className="text-2xl font-semibold text-green-600">
                            {onlineCount}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Offline Devices</p>
                        <p className="text-2xl font-semibold text-red-500">
                            {offlineCount}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Idle</p>
                        <p className="text-2xl font-semibold text-yellow-600">
                            {idleCount}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant={filter === "all" ? "default" : "outline"}
                        onClick={() => setFilter("all")}
                    >
                        All
                    </Button>

                    <Button
                        size="sm"
                        variant={filter === "online" ? "default" : "outline"}
                        onClick={() => setFilter("online")}
                    >
                        Online
                        <Badge variant="secondary" className="ml-2">
                            {onlineCount}
                        </Badge>
                    </Button>

                    <Button
                        size="sm"
                        variant={filter === "idle" ? "default" : "outline"}
                        onClick={() => setFilter("idle")}
                    >
                        Idle
                        <Badge className="ml-2 bg-yellow-100 text-yellow-700">
                            {idleCount}
                        </Badge>
                    </Button>

                    <Button
                        size="sm"
                        variant={filter === "offline" ? "default" : "outline"}
                        onClick={() => setFilter("offline")}
                    >
                        Offline
                        <Badge variant="destructive" className="ml-2">
                            {offlineCount}
                        </Badge>
                    </Button>

                </div>


                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="w-64 pl-8"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">Location</Button>
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Signal</TableHead>
                                    <TableHead className="text-center">
                                        Last Activity
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {paginatedDevices.map((device) => (
                                    <TableRow key={device.deviceId}>
                                        <TableCell>{device.deviceId}</TableCell>

                                        <TableCell>{device.location}</TableCell>

                                        <TableCell>
                                            <Badge
                                                className={
                                                    device.uiStatus === "online"
                                                        ? "bg-primary"
                                                        : device.uiStatus === "idle"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-destructive"
                                                }
                                            >
                                                {device.uiStatus}
                                            </Badge>

                                        </TableCell>

                                        <TableCell>
                                            {device.signalBars === 0 ? (
                                                <SignalBars strength={0} />
                                            ) : (
                                                <SignalBars
                                                    strength={device.signalBars}
                                                />
                                            )}
                                        </TableCell>

                                        <TableCell className="text-center text-muted-foreground">
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
                                                    <DropdownMenuItem onClick={() => console.log("View", device.deviceId)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem onClick={() => console.log("Edit", device.deviceId)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem onClick={() => console.log("Restart", device.deviceId)}>
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
                    )}
                </CardContent>

                <Separator />

                <DataPagination
                    totalItems={filteredDevices.length}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                />

            </Card>
        </div>
    )
}

export default OrgDeviceHealth
