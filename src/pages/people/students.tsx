import { useEffect, useMemo, useState } from "react";
import type { Student, StudentActiveStatus } from "@/types/student";
import { getStudentsByOrg } from "@/api/students";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Search, Filter, Plus } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

import { AppBreadcrumb } from "@/components/AppBreadCrumb";
import { timeAgo } from "@/utils/timeAgo";
import useAuth from "@/hooks/useAuth";
import AddStudentForm from "@/components/people/AddStudentForm";

type FilterStatus = "all" | Lowercase<StudentActiveStatus>;

const StudentsPage: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] =
        useState<FilterStatus>("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const { user } = useAuth();
    const orgId = user?.orgId;

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const matchesSearch = student.studentName
                .toLowerCase()
                .includes(search.toLowerCase());

            const isActive = student.isActive !== false;

            const matchesFilter =
                filterStatus === "all"
                    ? true
                    : filterStatus === "active"
                        ? isActive
                        : !isActive;

            return matchesSearch && matchesFilter;
        });
    }, [students, search, filterStatus]);

    const fetchStudents = () => {
        if (!orgId) return;

        setLoading(true);
        getStudentsByOrg(orgId)
            .then(setStudents)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchStudents();
    }, [orgId]);


    const TOTAL_STUDENTS = students.length;

    const ACTIVE_COUNT = students.filter(
        (s) => s.isActive !== false
    ).length;

    const INACTIVE_COUNT = students.filter(
        (s) => s.isActive === false
    ).length;


    return (
        <>
            <div className="space-y-6 p-6">
                <AppBreadcrumb />

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Students
                            </h1>

                            <span className="rounded-md bg-muted px-2 py-0.5 text-sm text-muted-foreground">
                                {TOTAL_STUDENTS}
                            </span>
                        </div>

                        <Button
                            className="gap-2 bg-primary"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Add Student
                        </Button>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        <span>
                            Total Students:
                            <span className="ml-1 font-medium text-foreground">
                                {TOTAL_STUDENTS}
                            </span>
                        </span>

                        <span>
                            Active:
                            <span className="ml-1 font-medium text-green-600">
                                {ACTIVE_COUNT}
                            </span>
                            <span className="ml-3">
                                Inactive:
                                <span className="ml-1 font-medium text-muted-foreground">
                                    {INACTIVE_COUNT}
                                </span>
                            </span>
                        </span>
                    </div>
                </div>

                <Separator />

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant={filterStatus === "all" ? "default" : "outline"}
                            onClick={() => setFilterStatus("all")}
                        >
                            All
                        </Button>

                        <Button
                            size="sm"
                            variant={
                                filterStatus === "active" ? "default" : "outline"
                            }
                            onClick={() => setFilterStatus("active")}
                        >
                            Active
                            <Badge variant="secondary" className="ml-2">
                                {ACTIVE_COUNT}
                            </Badge>
                        </Button>

                        <Button
                            size="sm"
                            variant={
                                filterStatus === "inactive" ? "default" : "outline"
                            }
                            onClick={() => setFilterStatus("inactive")}
                        >
                            Inactive
                            <Badge variant="secondary" className="ml-2">
                                {INACTIVE_COUNT}
                            </Badge>
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="w-64 pl-8"
                                placeholder="Search students..."
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
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Class & Section</TableHead>
                                    <TableHead>RFID</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Last Updated
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {loading && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center text-muted-foreground"
                                        >
                                            Loading students...
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading &&
                                    filteredStudents.map((student) => (
                                        <TableRow
                                            key={student.studentId}
                                            className={
                                                student.isActive === false
                                                    ? "opacity-60"
                                                    : ""
                                            }
                                        >
                                            <TableCell className="font-medium">
                                                {student.studentName}
                                            </TableCell>

                                            <TableCell>
                                                {student.studentPhone}
                                            </TableCell>

                                            <TableCell>
                                                {student.studentClass}-
                                                {student.studentSection}
                                            </TableCell>

                                            <TableCell>
                                                {student.rfidCode ?? (
                                                    <Badge variant="destructive">
                                                        Invalid
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {student.isActive ? (
                                                    <Badge className="bg-green-100 text-green-700 border border-green-300">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            <TableCell className="text-right text-muted-foreground">
                                                {timeAgo(student.updatedAt)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </CardContent>

                    <Separator />

                    {/* Pagination (UI only) */}
                    <div className="flex items-center justify-end gap-6 px-4">
                        <Field
                            orientation="horizontal"
                            className="w-fit gap-2"
                        >
                            <FieldLabel>Rows per page</FieldLabel>

                            <Select defaultValue="25">
                                <SelectTrigger className="h-8 w-20">
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
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

            <AddStudentForm
                open={sidebarOpen}
                onOpenChange={(open) => {
                    setSidebarOpen(open);
                    if (!open) fetchStudents(); 
                }}
            />

        </>
    );
};

export default StudentsPage;
