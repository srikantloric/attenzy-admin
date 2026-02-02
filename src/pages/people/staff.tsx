import { useMemo, useState } from "react";
import { staffData } from "@/data/staff";
import type { Staff, StaffStatus } from "@/data/staff";
import { PeopleSidebar } from "@/components/people/PeopleSidebar";

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

import { Search, Filter, Plus } from "lucide-react";

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

const TOTAL_STAFF = 56;

const StaffPage: React.FC = () => {
    const [search, setSearch] = useState<string>("");
    const [filter, setFilter] = useState<StaffStatus | "all">("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const filteredStaff = useMemo<Staff[]>(() => {
        return staffData.filter((staff) => {
            const matchesSearch = staff.name
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesFilter =
                filter === "all" ? true : staff.status === filter;

            return matchesSearch && matchesFilter;
        });
    }, [search, filter]);

    const invalidCount = staffData.filter(
        (s) => s.status === "invalid"
    ).length;

    return (
        <>
            <div className="space-y-6 p-6">

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        {/* Left: Title + Count */}
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Staff
                            </h1>

                            <span className="rounded-md bg-muted px-2 py-0.5 text-sm text-muted-foreground">
                                {TOTAL_STAFF}
                            </span>
                        </div>

                        {/* Right: Action */}
                        <Button
                            className="gap-2 bg-primary"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Add Staff
                        </Button>
                    </div>


                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>
                            Total Faculty:
                            <span className="ml-1 font-medium text-foreground">
                                {TOTAL_STAFF}
                            </span>
                        </span>

                        <span className="flex items-center gap-1 text-green-600">
                            +3
                            <span className="text-muted-foreground">added</span>
                        </span>

                        <span className="flex items-center gap-1 text-red-500">
                            -2
                            <span className="text-muted-foreground">removed</span>
                        </span>
                    </div>
                </div>

                <Separator />

                {/* Stats Card */}
                {/* <div className="grid grid-cols-1">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">
                            Total Staff
                        </p>
                        <p className="text-2xl font-semibold">
                            {TOTAL_STAFF}
                            <span className="ml-2 text-sm text-green-600">+4</span>
                        </p>
                    </CardContent>
                </Card>
            </div> */}

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
                            variant={filter === "invalid" ? "default" : "outline"}
                            onClick={() => setFilter("invalid")}
                        >
                            Invalid
                            <Badge variant="destructive" className="ml-2">
                                {invalidCount}
                            </Badge>
                        </Button>
                    </div>

                    {/* Search */}
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
                                <Button variant="outline" size="icon">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Position</DropdownMenuItem>
                                <DropdownMenuItem>RFID Status</DropdownMenuItem>
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
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>RFID Card Number</TableHead>
                                    <TableHead className="text-right">
                                        Last Seen
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {filteredStaff.map((staff) => (
                                    <TableRow key={staff.id}>
                                        <TableCell>{staff.id}</TableCell>

                                        <TableCell className="font-medium">
                                            {staff.name}
                                        </TableCell>

                                        <TableCell>{staff.contact}</TableCell>

                                        <TableCell>{staff.position}</TableCell>

                                        <TableCell>
                                            {staff.rfid ?? (
                                                <Badge variant="destructive">
                                                    Invalid
                                                </Badge>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-right text-muted-foreground">
                                            {staff.lastSeen}
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

            <PeopleSidebar
                open={sidebarOpen}
                onOpenChange={setSidebarOpen}
                type="staff"
            />

        </>
    );
};

export default StaffPage;
