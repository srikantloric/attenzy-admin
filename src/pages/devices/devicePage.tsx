import { Button } from "@/components/ui/button"
import {
    Activity,
    Eye,
    MoreVertical,
    Pencil,
    Plus,
    Search,
    Trash2,
} from "lucide-react"
import { useEffect, useMemo, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
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

import { type Device } from "@/types/device"
import AddDevice from "@/components/device/AddDevice"

import { getOrganizationsByPartner } from "@/api/organization"
import { getDevicesByOrgs } from "@/api/device"

import useAuth from "@/hooks/useAuth"

type OrgMap = Record<string, string>

function DevicePage() {
    const { user } = useAuth()
    const partnerId = user?.partnerId

    const [addDeviceOpen, setDeviceOpen] = useState(false)
    const [searchString, setSearchString] = useState("")
    const [selectedDeviceStatus, setSelectedDeviceStatus] = useState("all")

    const [allDevices, setAllDevices] = useState<Device[]>([])
    const [orgMap, setOrgMap] = useState<OrgMap>({})

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchDevices = useCallback(async () => {
        if (!partnerId) return

        try {
            setLoading(true)
            setError(null)

            // 1️⃣ fetch organizations for partner
            const orgRes = await getOrganizationsByPartner(partnerId)

            const orgIds = orgRes.items.map((org) => org.orgId)

            // build orgId → orgName map
            const map: OrgMap = {}
            orgRes.items.forEach((org) => {
                map[org.orgId] = org.orgName
            })
            setOrgMap(map)

            if (orgIds.length === 0) {
                setAllDevices([])
                return
            }

            // 2️⃣ fetch devices across orgs
            const devices = await getDevicesByOrgs(orgIds)
            setAllDevices(devices)
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

    if (!partnerId) {
        return (
            <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
                Partner information not available. Please login again.
            </div>
        )
    }

    const filteredDevices = useMemo(() => {
        return allDevices.filter((device) => {
            const matchesSearch =
                device.deviceId.toLowerCase().includes(searchString.toLowerCase()) ||
                device.serialNumber.toLowerCase().includes(searchString.toLowerCase()) ||
                device.location.toLowerCase().includes(searchString.toLowerCase()) ||
                (orgMap[device.orgId]?.toLowerCase() ?? "").includes(
                    searchString.toLowerCase()
                )

            const matchesStatus =
                selectedDeviceStatus === "all" ||
                device.status.toLowerCase() === selectedDeviceStatus

            return matchesSearch && matchesStatus
        })
    }, [allDevices, searchString, selectedDeviceStatus, orgMap])

    const statusBadge = (status: string) => {
        switch (status) {
            case "ONLINE":
                return "bg-green-100 text-green-700"
            case "IDLE":
                return "bg-yellow-100 text-yellow-700"
            case "OFFLINE":
                return "bg-red-100 text-red-700"
            default:
                return "bg-muted text-muted-foreground"
        }
    }

    return (
        <div className="space-y-4 mt-4">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold">Devices</h1>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-sm">
                        {filteredDevices.length}
                    </span>
                </div>

                <Button className="bg-primary" onClick={() => setDeviceOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Device
                </Button>
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
                    onValueChange={setSelectedDeviceStatus}
                >
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="idle">Idle</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
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
                            {filteredDevices.map((device) => (
                                <TableRow key={device.deviceId}>
                                    <TableCell className="font-medium">
                                        {device.deviceId}
                                    </TableCell>
                                    <TableCell>{device.serialNumber}</TableCell>
                                    <TableCell>
                                        {orgMap[device.orgId] ?? device.orgId}
                                    </TableCell>
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
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
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
            </Card>

            <AddDevice
                open={addDeviceOpen}
                setOpen={setDeviceOpen}
                onClose={() => setDeviceOpen(false)}
            />
        </div>
    )
}

export default DevicePage
