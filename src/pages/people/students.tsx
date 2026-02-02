import { useMemo, useState } from "react";
import { studentsData } from "@/data/students";
import type { Student, StudentStatus } from "@/data/students";
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

const TOTAL_STUDENTS = 1200;
const RFID_ISSUED = 950;

const StudentsPage: React.FC = () => {
    const [search, setSearch] = useState<string>("");
    const [filter, setFilter] = useState<StudentStatus | "all">("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const filteredStudents = useMemo<Student[]>(() => {
        return studentsData.filter((student) => {
            const matchesSearch = student.name
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesFilter =
                filter === "all" ? true : student.status === filter;

            return matchesSearch && matchesFilter;
        });
    }, [search, filter]);

    const countByStatus = (status: StudentStatus) =>
        studentsData.filter((s) => s.status === status).length;

    return (
        <>
            <div className="space-y-6 p-6">

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        {/* Left: Title + Count */}
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Students
                            </h1>

                            <span className="rounded-md bg-muted px-2 py-0.5 text-sm text-muted-foreground">
                                {TOTAL_STUDENTS}
                            </span>
                        </div>

                        {/* Right: Action */}
                        <Button
                            className="gap-2 bg-primary"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Add Student
                        </Button>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        {/* Total Students */}
                        <div className="flex flex-row gap-2">
                            <span>
                                Total Students:
                                <span className="ml-1 font-medium text-foreground">
                                    {TOTAL_STUDENTS}
                                </span>
                            </span>

                            {/* Added / Removed */}
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1 text-green-600">
                                    +8
                                    <span className="text-muted-foreground">added</span>
                                </span>

                                <span className="flex items-center gap-1 text-red-500">
                                    -3
                                    <span className="text-muted-foreground">removed
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* RFID Issued */}
                        <span>
                            RFID Issued:
                            <span className="ml-1 font-medium text-foreground">
                                {RFID_ISSUED}
                            </span>
                            <span className="ml-2 text-green-600">+5
                                <span className="text-muted-foreground ml-1">added</span>
                            </span>
                        </span>
                    </div>
                </div>

                <Separator />

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Toggle Filters */}
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
                                <Button variant="outline" size="icon">
                                    <Filter className="h-4 w-4" />
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
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Class & Section</TableHead>
                                    <TableHead>RFID Card Number</TableHead>
                                    <TableHead className="text-right">Last Seen</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {filteredStudents.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.id}</TableCell>
                                        <TableCell className="font-medium">
                                            {student.name}
                                        </TableCell>
                                        <TableCell>{student.contact}</TableCell>
                                        <TableCell>
                                            {student.classSection ?? (
                                                <Badge variant="secondary">Unassigned</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {student.rfid ?? (
                                                <Badge variant="destructive">Invalid</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {student.lastSeen}
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
                type="student"
            />

        </>
    );
};



export default StudentsPage;
