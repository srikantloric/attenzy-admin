import { useEffect, useMemo, useState } from "react";
import type { Student, StudentActiveStatus } from "@/types/student";
import { getStudentsByOrg, updateStudent } from "@/api/students";
import { toast } from "sonner";

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

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

import { Field, FieldLabel } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Search, Plus, MoreVertical, Ban, Pencil } from "lucide-react";

import { AppBreadcrumb } from "@/components/AppBreadCrumb";
import { timeAgo } from "@/utils/timeAgo";
import useAuth from "@/hooks/useAuth";

import AddStudentForm from "@/components/people/student/AddStudentForm";
import ConfirmDialog from "@/components/common/ConfirmDialog";

type FilterStatus = "all" | Lowercase<StudentActiveStatus>;
type FormMode = "add" | "edit";

const StudentsPage: React.FC = () => {
    const { user } = useAuth();
    const orgId = user?.orgId;

    const [students, setStudents] = useState<Student[]>([]);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] =
        useState<FilterStatus>("all");

    const [loading, setLoading] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [formMode, setFormMode] = useState<FormMode>("add");
    const [selectedStudent, setSelectedStudent] =
        useState<Student | null>(null);

    const [confirmStudent, setConfirmStudent] =
        useState<Student | null>(null);

    /* ================= FETCH ================= */

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

    /* ================= STATUS TOGGLE ================= */

    const toggleStudentStatus = async (student: Student) => {
        if (!orgId) return;

        try {
            await updateStudent({
                studentId: student.studentId,
                orgId,
                isActive: !student.isActive,
            });

            toast.success(
                student.isActive
                    ? "Student suspended"
                    : "Student activated"
            );

            fetchStudents();
        } catch (error: any) {
            toast.error(error?.message || "Failed to update status");
        }
    };



    /* ================= FILTER ================= */

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

    /* ================= COUNTS ================= */

    const TOTAL_STUDENTS = students.length;
    const ACTIVE_COUNT = students.filter(
        (s) => s.isActive !== false
    ).length;
    const INACTIVE_COUNT = students.filter(
        (s) => s.isActive === false
    ).length;

    /* ================= RENDER ================= */

    return (
        <>
            <div className="space-y-6 p-6">
                <AppBreadcrumb />

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold">Students</h1>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-sm">
                            {TOTAL_STUDENTS}
                        </span>
                    </div>

                    <Button
                        className="gap-2 bg-primary"
                        onClick={() => {
                            setFormMode("add");
                            setSelectedStudent(null);
                            setSidebarOpen(true);
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        Add Student
                    </Button>
                </div>

                {/* Meta */}
                <div className="text-sm text-muted-foreground">
                    Active:{" "}
                    <span className="text-green-600 font-medium">
                        {ACTIVE_COUNT}
                    </span>
                    <span className="ml-4">
                        Inactive:{" "}
                        <span className="font-medium">{INACTIVE_COUNT}</span>
                    </span>
                </div>

                <Separator />

                {/* Filters */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-2">
                        {(["all", "active", "inactive"] as FilterStatus[]).map(
                            (status) => (
                                <Button
                                    key={status}
                                    size="sm"
                                    variant={
                                        filterStatus === status
                                            ? "default"
                                            : "outline"
                                    }
                                    onClick={() => setFilterStatus(status)}
                                >
                                    {status.charAt(0).toUpperCase() +
                                        status.slice(1)}
                                </Button>
                            )
                        )}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="pl-8 w-64"
                            placeholder="Search students..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
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
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {loading && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center"
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
                                                    <Badge className="bg-green-100 text-green-700">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            <TableCell className="text-right">
                                                {timeAgo(student.updatedAt)}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button size="icon" variant="ghost">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedStudent(student);
                                                                setFormMode("edit");
                                                                setSidebarOpen(true);
                                                            }}
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            className={
                                                                student.isActive === false
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                            }
                                                            onClick={() =>
                                                                setConfirmStudent(student)
                                                            }
                                                        >
                                                            <Ban className="mr-2 h-4 w-4" />
                                                            {student.isActive === false
                                                                ? "Activate"
                                                                : "Suspend"}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </CardContent>

                    <Separator />

                    {/* Pagination */}
                    <div className="flex items-center justify-end gap-4 mr-4">
                        <Field orientation="horizontal" className="w-fit">
                            <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel>
                            <Select defaultValue="25">
                                <SelectTrigger className="w-20" id="select-rows-per-page">
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

            {/* Sidebar Form */}
            <AddStudentForm
                open={sidebarOpen}
                onOpenChange={setSidebarOpen}
                mode={formMode}
                student={selectedStudent}
                onSuccess={fetchStudents}
            />

            {/* Confirmation Dialog */}
            <ConfirmDialog
                open={!!confirmStudent}
                title={
                    confirmStudent?.isActive === false
                        ? "Activate Student"
                        : "Suspend Student"
                }
                description={
                    confirmStudent?.isActive === false
                        ? "This student will become active again."
                        : "This student will be suspended and lose access."
                }
                confirmText={
                    confirmStudent?.isActive === false
                        ? "Activate"
                        : "Suspend"
                }
                onCancel={() => setConfirmStudent(null)}
                onConfirm={() => {
                    if (confirmStudent) {
                        toggleStudentStatus(confirmStudent)
                        setConfirmStudent(null)
                    }
                }}
            />

        </>
    );
};

export default StudentsPage;
