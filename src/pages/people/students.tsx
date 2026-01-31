import { useMemo, useState } from "react";
import { studentsData } from "@/data/students";
import type { Student, StudentStatus } from "@/data/students";

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

const TOTAL_STUDENTS = 1200;
const RFID_ISSUED = 950;

const StudentsPage: React.FC = () => {
    const [search, setSearch] = useState<string>("");
    const [filter, setFilter] = useState<StudentStatus | "all">("all");

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
        <div className="space-y-6 p-6">

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Students
                </h1>

                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Assign RFID
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">
                            Total Students
                        </p>
                        <p className="text-2xl font-semibold">
                            {TOTAL_STUDENTS}
                            <span className="ml-2 text-sm text-green-600">+8</span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">
                            RFID Cards Issued
                        </p>
                        <p className="text-2xl font-semibold">
                            {RFID_ISSUED}
                            <span className="ml-2 text-sm text-green-600">+5</span>
                        </p>
                    </CardContent>
                </Card>
            </div>

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

            <Separator />

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
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <Button variant="ghost" size="sm">Previous</Button>
                <span>1 of 45</span>
                <Button variant="ghost" size="sm">Next</Button>
            </div>
        </div>
    );
};

export default StudentsPage;
