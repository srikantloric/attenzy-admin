import { Button } from "@/components/ui/button"
import { devices as deviceMock } from "./device-mock"
import { Activity, Eye,  MoreVertical, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import AddDeviceSheet from "@/components/sheet/AddDeviceSheet"
import { Card } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { type Device } from "@/types/device"

function DevicePageNew() {
    const [addDeviceSheetOpen, setDeviceSheetOpen] = useState(false)

    const [searchString, setSearchString] = useState("")
    const [selectedDeviceStatus, setSelectedDeviceStatus] = useState("all")

    const [allDevices, setAllDevices] = useState<Device[]>([])

    useEffect(() => {
        // initial load
        setAllDevices(deviceMock)
    }, [])

    const filteredDevices = useMemo(() => {
        return allDevices.filter((device) => {
            const matchesSearch =
                device.deviceId.toLowerCase().includes(searchString.toLowerCase()) ||
                device.serialNumber.toLowerCase().includes(searchString.toLowerCase()) ||
                device.location.toLowerCase().includes(searchString.toLowerCase())

            // mock status (replace with real field later)
            const deviceStatus = Number(device.deviceId.replace("dev", "")) % 2 === 0
                ? "active"
                : "inactive"

            const matchesStatus =
                selectedDeviceStatus === "all" ||
                deviceStatus === selectedDeviceStatus

            return matchesSearch && matchesStatus
        })
    }, [allDevices, searchString, selectedDeviceStatus])

    return (
        <div className="space-y-4">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold">Devices</h1>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-sm">
                        {filteredDevices.length}
                    </span>
                </div>

                <Button onClick={() => setDeviceSheetOpen(true)} className="bg-primary">
                    <Plus className="h-4 w-4" />
                    Add Device
                </Button>
            </div>

            {/* FILTERS */}
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-8 w-56"
                        placeholder="Search devices..."
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
                        <SelectItem value="active">Online</SelectItem>
                        <SelectItem value="inactive">Offline</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* TABLE */}
            <Card className="px-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Device ID</TableHead>
                            <TableHead>Serial No</TableHead>
                            <TableHead>Organization</TableHead>
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

                                <TableCell>{device.orgId}</TableCell>

                                <TableCell className="text-right">

                                    <Button variant={"ghost"}><Activity /></Button>

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
            </Card>

            <AddDeviceSheet
                open={addDeviceSheetOpen}
                setOpen={setDeviceSheetOpen}
                onClose={() => setDeviceSheetOpen(false)}
            />
        </div>
    )
}

export default DevicePageNew
