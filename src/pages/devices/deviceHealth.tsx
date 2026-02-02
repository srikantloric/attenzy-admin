import { useMemo, useState } from "react";
import { deviceHealthData } from "@/data/deviceHealth";
import type { DeviceHealth, DeviceStatus } from "@/data/deviceHealth";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { Search, Filter } from "lucide-react";
import SignalBars from "@/components/SignalBars";
import { Field, FieldLabel } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const TOTAL_DEVICES = 20;

const DeviceHealthPage: React.FC = () => {
    const [search, setSearch] = useState("");
    const [filter, setFilter] =
        useState<"all" | "online" | "offline" | "alerts">("all");

    const filteredDevices = useMemo<DeviceHealth[]>(() => {
        return deviceHealthData.filter((device) => {
            const matchesSearch = device.name
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesFilter =
                filter === "all"
                    ? true
                    : filter === "alerts"
                        ? device.alerts > 0
                        : device.status === filter;

            return matchesSearch && matchesFilter;
        });
    }, [search, filter]);

    const onlineCount = deviceHealthData.filter(
        (d) => d.status === "online"
    ).length;

    const offlineCount = deviceHealthData.filter(
        (d) => d.status === "offline"
    ).length;

    const alertCount = deviceHealthData.filter(
        (d) => d.alerts > 0
    ).length;

    return (
        <div className="space-y-6 p-6">

            {/* Header */}
            <h1 className="text-2xl font-semibold tracking-tight">
                Device Health
            </h1>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">
                            Total Devices
                        </p>
                        <p className="text-2xl font-semibold">{TOTAL_DEVICES}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">
                            Online Devices
                        </p>
                        <p className="text-2xl font-semibold text-green-600">
                            {onlineCount}
                            <span className="ml-2 text-sm">+1</span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">
                            Offline Devices
                        </p>
                        <p className="text-2xl font-semibold text-red-500">
                            {offlineCount}
                            <span className="ml-2 text-sm">-1</span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">
                            Alerts
                        </p>
                        <p className="text-2xl font-semibold text-yellow-600">
                            {alertCount}
                            <span className="ml-2 text-sm">+2</span>
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
                        variant={filter === "offline" ? "default" : "outline"}
                        onClick={() => setFilter("offline")}
                    >
                        Offline
                        <Badge variant="destructive" className="ml-2">
                            {offlineCount}
                        </Badge>
                    </Button>

                    <Button
                        size="sm"
                        variant={filter === "alerts" ? "default" : "outline"}
                        onClick={() => setFilter("alerts")}
                    >
                        Alerts
                        <Badge className="ml-2 bg-yellow-100 text-yellow-700">
                            {alertCount}
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
                            <Button variant="outline">
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

            {/* Table */}
            <Card>
                <CardContent className="">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                                {/* <TableHead>Sensor</TableHead> */}
                                <TableHead>Signal</TableHead>
                                <TableHead>Alerts</TableHead>
                                <TableHead className="text-right">
                                    Last Activity
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredDevices.map((device) => (
                                <TableRow key={device.id}>
                                    <TableCell>{device.id}</TableCell>
                                    <TableCell className="font-medium">
                                        {device.name}
                                    </TableCell>
                                    <TableCell>{device.location}</TableCell>

                                    <TableCell>
                                        <Badge
                                            className={
                                                device.status === "online"
                                                    ? "bg-primary"
                                                    : "bg-destructive"
                                            }
                                        >
                                            {device.status}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        {device.signalBars === 0 ? (
                                            <span className="text-muted-foreground">—</span>
                                        ) : (
                                            <SignalBars strength={device.signalBars} />
                                        )}
                                    </TableCell>


                                    <TableCell>
                                        {device.alerts > 0 ? (
                                            <Badge className="bg-yellow-100 text-yellow-700">
                                                {device.alerts} Alerts
                                            </Badge>
                                        ) : (
                                            "0"
                                        )}
                                    </TableCell>

                                    <TableCell className="text-right text-muted-foreground">
                                        {device.lastActivity}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <Separator />

                {/* Pagination */}
                <div className="flex items-center justify-end gap-6 px-4">
                    <Field orientation="horizontal" className="w-fit gap-2">
                        <FieldLabel htmlFor="select-rows-per-page">
                            Rows per page
                        </FieldLabel>

                        <Select defaultValue="25">
                            <SelectTrigger className="h-8 w-20" id="select-rows-per-page">
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent align="start">
                                <SelectGroup>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>

                    <Pagination className="mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#" />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext href="#" />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </Card>

        </div>
    );
};

export default DeviceHealthPage;
