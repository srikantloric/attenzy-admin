import { useEffect, useMemo, useState, useCallback } from "react"
import {
    Activity,
    Eye,
    MoreVertical,
    Pencil,
    Plus,
    Search,
    Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import type { Device, DeviceStatus } from "@/types/device"
import AddDevice from "@/components/device/PartnerAddDevice"
import useAuth from "@/hooks/useAuth"
import { AppBreadcrumb } from "@/components/AppBreadCrumb"
import { getDevicesByPartner } from "@/api/device"
import DataPagination from "@/components/Pagination"

function PartnerDevice() {
    const { user } = useAuth()
    const partnerId = user?.partnerId

    const [addDeviceOpen, setAddDeviceOpen] = useState(false)
    const [searchString, setSearchString] = useState("")
    const [selectedDeviceStatus, setSelectedDeviceStatus] =
        useState<DeviceStatus | "all">("all")

    const [allDevices, setAllDevices] = useState<Device[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(8)

    const fetchDevices = useCallback(async () => {
        if (!partnerId) return

        try {
            setLoading(true)
            setError(null)

            const data = await getDevicesByPartner(partnerId)

            const items = (data.items ?? []) as Device[]

            const uniqueDevices: Device[] = Array.from(
                new Map(
                    items.map((d) => [d.deviceId, d])
                ).values()
            )
            setAllDevices(uniqueDevices)

        } catch (err: any) {
            console.error(err)
            setError(err.message || "Failed to load devices")
        } finally {
            setLoading(false)
        }
    }, [partnerId])

    useEffect(() => {
        fetchDevices()
    }, [fetchDevices])

    const filteredDevices = useMemo(() => {
        const search = searchString.trim().toLowerCase()

        return allDevices.filter((device) => {
            const matchesSearch =
                !search ||
                device.deviceId?.toLowerCase().includes(search) ||
                device.serialNumber?.toLowerCase().includes(search) ||
                device.location?.toLowerCase().includes(search) ||
                device.orgName?.toLowerCase().includes(search)

            const matchesStatus =
                selectedDeviceStatus === "all" ||
                device.status === selectedDeviceStatus

            return matchesSearch && matchesStatus
        })
    }, [allDevices, searchString, selectedDeviceStatus])

    const paginatedDevices = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage
        const end = currentPage * rowsPerPage
        return filteredDevices.slice(start, end)
    }, [filteredDevices, currentPage, rowsPerPage])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchString, selectedDeviceStatus])


    const statusCounts = useMemo(() => {
        return allDevices.reduce(
            (acc, device) => {
                acc.all++
                acc[device.status]++
                return acc
            },
            {
                all: 0,
                ONLINE: 0,
                IDLE: 0,
                OFFLINE: 0,
                INACTIVE: 0,
            } as Record<DeviceStatus | "all", number>
        )
    }, [allDevices])


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

    if (!partnerId) {
        return (
            <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
                Partner information not available. Please login again.
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            <AppBreadcrumb />

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold">Devices</h1>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-sm">
                        {filteredDevices.length}
                    </span>
                </div>

                <Button className="bg-primary" onClick={() => setAddDeviceOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Device
                </Button>
            </div>

            {/* Status Counts */}
            <div className="flex flex-wrap gap-2">

                <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    Online: {statusCounts.ONLINE}
                </span>

                <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                    Idle: {statusCounts.IDLE}
                </span>

                <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                    Offline: {statusCounts.OFFLINE}
                </span>

                <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
                    Inactive: {statusCounts.INACTIVE}
                </span>
            </div>

            {/* FILTERS */}
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-8 w-56"
                        placeholder="Search devices, orgs, locations..."
                        value={searchString}
                        onChange={(e) => setSearchString(e.target.value)}
                    />
                </div>

                <Select
                    value={selectedDeviceStatus}
                    onValueChange={(value) =>
                        setSelectedDeviceStatus(value as DeviceStatus | "all")
                    }
                >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="ONLINE">Online</SelectItem>
                        <SelectItem value="IDLE">Idle</SelectItem>
                        <SelectItem value="OFFLINE">Offline</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* TABLE */}
            <Card className="px-4">
                {loading && (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                        Loading devices...
                    </div>
                )}

                {!loading && error && (
                    <div className="py-10 text-center text-sm text-red-600">
                        {error}
                    </div>
                )}

                {!loading && !error && filteredDevices.length === 0 && (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                        No devices found
                    </div>
                )}

                {!loading && !error && filteredDevices.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Device ID</TableHead>
                                <TableHead>Serial No</TableHead>
                                <TableHead>Organization</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {paginatedDevices.map((device) => (
                                <TableRow key={device.deviceId}>
                                    <TableCell className="font-medium">
                                        {device.deviceId}
                                    </TableCell>
                                    <TableCell>{device.serialNumber}</TableCell>
                                    <TableCell>{device.orgName}</TableCell>
                                    <TableCell>{device.location}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(
                                                device.status
                                            )}`}
                                        >
                                            {device.status}
                                        </span>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <Activity className="h-4 w-4" />
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Eye className="mr-2 h-4 w-4" /> View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                <Separator />

                <DataPagination
                    totalItems={filteredDevices.length}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                />

            </Card>

            <AddDevice
                open={addDeviceOpen}
                setOpen={setAddDeviceOpen}
                onSuccess={() => {
                    fetchDevices()
                }}
            />

        </div>
    )
}

export default PartnerDevice
