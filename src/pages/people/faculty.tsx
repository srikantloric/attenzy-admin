import { useEffect, useMemo, useState } from "react";
import type { Faculty } from "@/types/faculty";
import { getFaculty, updateFaculty } from "@/api/faculty";
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

import AddFacultyForm from "@/components/people/faculty/AddFacultyForm";
import ConfirmDialog from "@/components/common/ConfirmDialog";

type FilterStatus = "all" | "active" | "inactive";
type FormMode = "add" | "edit";

const FacultyPage: React.FC = () => {
    const { user } = useAuth();
    const orgId = user?.orgId;

    const [faculty, setFaculty] = useState<Faculty[]>([]);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] =
        useState<FilterStatus>("all");

    const [loading, setLoading] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [formMode, setFormMode] = useState<FormMode>("add");
    const [selectedFaculty, setSelectedFaculty] =
        useState<Faculty | null>(null);

    const [confirmFaculty, setConfirmFaculty] =
        useState<Faculty | null>(null);

    /* ================= FETCH ================= */

    const fetchFaculty = () => {
        if (!orgId) return;

        setLoading(true);

        getFaculty(orgId)
            .then(setFaculty)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchFaculty();
    }, [orgId]);

    /* ================= STATUS TOGGLE ================= */

    const toggleFacultyStatus = async (faculty: Faculty) => {
        if (!orgId) return;

        try {
            await updateFaculty({
                facultyId: faculty.facultyId,
                orgId,
                isActive: !faculty.isActive,
            });

            toast.success(
                faculty.isActive
                    ? "Faculty suspended"
                    : "Faculty activated"
            );

            fetchFaculty();
        } catch (error: any) {
            toast.error(error?.message || "Failed to update status");
        }
    };

    /* ================= FILTER ================= */

    const filteredFaculty = useMemo(() => {
        return faculty.filter((f) => {
            const matchesSearch = f.facultyName
                .toLowerCase()
                .includes(search.toLowerCase());

            const isActive = f.isActive !== false;

            const matchesFilter =
                filterStatus === "all"
                    ? true
                    : filterStatus === "active"
                        ? isActive
                        : !isActive;

            return matchesSearch && matchesFilter;
        });
    }, [faculty, search, filterStatus]);

    /* ================= COUNTS ================= */

    const TOTAL = faculty.length;
    const ACTIVE_COUNT = faculty.filter(
        (f) => f.isActive !== false
    ).length;
    const INACTIVE_COUNT = faculty.filter(
        (f) => f.isActive === false
    ).length;

    /* ================= RENDER ================= */

    return (
        <>
            <div className="space-y-6 p-6">
                <AppBreadcrumb />

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold">
                            Faculty
                        </h1>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-sm">
                            {TOTAL}
                        </span>
                    </div>

                    <Button
                        className="gap-2 bg-primary"
                        onClick={() => {
                            setSelectedFaculty(null);   
                            setFormMode("add");         
                            setSidebarOpen(true);
                        }}
                    >

                        <Plus className="h-4 w-4" />
                        Add Faculty
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
                        <span className="font-medium">
                            {INACTIVE_COUNT}
                        </span>
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
                            placeholder="Search faculty..."
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
                                    <TableHead>Department</TableHead>
                                    <TableHead>Phone</TableHead>
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
                                            Loading faculty...
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading &&
                                    filteredFaculty.map((f) => (
                                        <TableRow
                                            key={f.facultyId}
                                            className={
                                                f.isActive === false
                                                    ? "opacity-60"
                                                    : ""
                                            }
                                        >
                                            <TableCell className="font-medium">
                                                {f.facultyName}
                                            </TableCell>

                                            <TableCell>
                                                {f.facultyDepartment}
                                            </TableCell>

                                            <TableCell>
                                                {f.facultyPhone}
                                            </TableCell>

                                            <TableCell>
                                                {f.rfidCode ?? (
                                                    <Badge variant="destructive">
                                                        Invalid
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {f.isActive ? (
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
                                                {timeAgo(f.updatedAt)}
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
                                                                setSelectedFaculty(f);
                                                                setFormMode("edit");
                                                                setSidebarOpen(true);
                                                            }}
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            className={
                                                                f.isActive === false
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                            }
                                                            onClick={() =>
                                                                setConfirmFaculty(f)
                                                            }
                                                        >
                                                            <Ban className="mr-2 h-4 w-4" />
                                                            {f.isActive === false
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

                    {/* Pagination UI */}
                    <div className="flex items-center justify-end gap-4 mr-4">
                        <Field orientation="horizontal" className="w-fit">
                            <FieldLabel>
                                Rows per page
                            </FieldLabel>
                            <Select defaultValue="25">
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="10">
                                            10
                                        </SelectItem>
                                        <SelectItem value="25">
                                            25
                                        </SelectItem>
                                        <SelectItem value="50">
                                            50
                                        </SelectItem>
                                        <SelectItem value="100">
                                            100
                                        </SelectItem>
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
            <AddFacultyForm
                open={sidebarOpen}
                onOpenChange={setSidebarOpen}
                mode={formMode}
                faculty={selectedFaculty}
                onSuccess={fetchFaculty}
            />

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={!!confirmFaculty}
                title={
                    confirmFaculty?.isActive === false
                        ? "Activate Faculty"
                        : "Suspend Faculty"
                }
                description={
                    confirmFaculty?.isActive === false
                        ? "This faculty will become active again."
                        : "This faculty will be suspended."
                }
                confirmText={
                    confirmFaculty?.isActive === false
                        ? "Activate"
                        : "Suspend"
                }
                onCancel={() => setConfirmFaculty(null)}
                onConfirm={() => {
                    if (confirmFaculty) {
                        toggleFacultyStatus(confirmFaculty);
                        setConfirmFaculty(null);
                    }
                }}
            />
        </>
    );
};

export default FacultyPage;
