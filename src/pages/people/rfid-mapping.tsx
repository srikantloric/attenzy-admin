import { useMemo, useState } from "react";
import { rfidMappingData } from "@/data/rfidMapping";
import type { RFIDMapping, RFIDStatus } from "@/data/rfidMapping";
import { AssignRFIDSidebar } from "@/components/rfid/AssignRFIDSidebar";

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

import { Search, Plus } from "lucide-react";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import { Field, FieldLabel } from "@/components/ui/field";
import { AppBreadcrumb } from "@/components/AppBreadCrumb";

const TOTAL_STUDENTS = 1200;
const RFID_ISSUED = 950;

const RFIDMappingPage: React.FC = () => {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<RFIDStatus | "all">("all");
    const [assignOpen, setAssignOpen] = useState(false);

    const filteredData = useMemo<RFIDMapping[]>(() => {
        return rfidMappingData.filter((item) => {
            const matchesSearch = item.name
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesFilter =
                filter === "all" ? true : item.status === filter;

            return matchesSearch && matchesFilter;
        });
    }, [search, filter]);

    const countByStatus = (status: RFIDStatus) =>
        rfidMappingData.filter((d) => d.status === status).length;

    return (
        <>
            <div className="space-y-6 p-6">
                <AppBreadcrumb />

                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        RFID Device Mapping
                    </h1>

                    <Button
                        className="gap-2 bg-primary"
                        onClick={() => setAssignOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Assign RFID Card
                    </Button>
                </div>

                {/* Meta info */}
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    {/* Total Students + Added/Removed */}
                    <div className="flex flex-wrap items-center gap-3">
                        <span>
                            Total Students:
                            <span className="ml-1 font-medium text-foreground">
                                {TOTAL_STUDENTS}
                            </span>
                        </span>

                        <span className="flex items-center gap-1 text-green-600">
                            +8
                            <span className="text-muted-foreground">added</span>
                        </span>

                        <span className="flex items-center gap-1 text-red-500">
                            -3
                            <span className="text-muted-foreground">removed</span>
                        </span>
                    </div>

                    {/* RFID Issued */}
                    <div>
                        RFID Issued:
                        <span className="ml-1 font-medium text-foreground">
                            {RFID_ISSUED}
                        </span>
                        <span className="ml-2 flex inline-flex items-center gap-1 text-green-600">
                            +5
                            <span className="text-muted-foreground">added</span>
                        </span>
                    </div>
                </div>

                <Separator />

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Toggle */}
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
                            variant={filter === "assigned" ? "default" : "outline"}
                            onClick={() => setFilter("assigned")}
                        >
                            Assigned
                        </Button>

                        <Button
                            size="sm"
                            variant={filter === "unassigned" ? "default" : "outline"}
                            onClick={() => setFilter("unassigned")}
                        >
                            Unassigned
                            <Badge variant="secondary" className="ml-2">
                                {countByStatus("unassigned")}
                            </Badge>
                        </Button>

                        <Button
                            size="sm"
                            variant={filter === "invalid" ? "default" : "outline"}
                            onClick={() => setFilter("invalid")}
                        >
                            Invalid
                            <Badge variant="destructive" className="ml-2">
                                {countByStatus("invalid")}
                            </Badge>
                        </Button>
                    </div>

                    {/* Search + Class Filter */}
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
                                    Class
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Class 8</DropdownMenuItem>
                                <DropdownMenuItem>Class 9</DropdownMenuItem>
                                <DropdownMenuItem>Class 10</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Class & Section</TableHead>
                                    <TableHead>RFID Card Number</TableHead>
                                    <TableHead>RFID Device</TableHead>
                                    <TableHead className="text-right">
                                        Last Seen
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {filteredData.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.id}</TableCell>
                                        <TableCell className="font-medium">
                                            {row.name}
                                        </TableCell>
                                        <TableCell>{row.contact}</TableCell>

                                        <TableCell>
                                            {row.classSection ?? (
                                                <Badge variant="secondary">Unassigned</Badge>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {row.rfidCard ?? "Invalid Card"}
                                        </TableCell>

                                        <TableCell>
                                            {row.rfidDevice ?? "—"}
                                        </TableCell>

                                        <TableCell className="text-right text-muted-foreground">
                                            {row.lastSeen}
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

            <AssignRFIDSidebar
                open={assignOpen}
                onOpenChange={setAssignOpen}
            />

        </>
    );
};

export default RFIDMappingPage;
