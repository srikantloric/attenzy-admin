import { useEffect, useMemo, useState } from "react";
import type { Staff } from "@/types/staff";
import { getStaffByOrg, updateStaff } from "@/api/staff";
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

import AddStaffForm from "@/components/people/staff/AddStaffForm";
import ConfirmDialog from "@/components/common/ConfirmDialog";

type FilterStatus = "all" | "active" | "inactive";
type FormMode = "add" | "edit";

const StaffPage: React.FC = () => {
    const { user } = useAuth();
    const orgId = user?.orgId;

    const [staff, setStaff] = useState<Staff[]>([]);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] =
        useState<FilterStatus>("all");

    const [loading, setLoading] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [formMode, setFormMode] = useState<FormMode>("add");
    const [selectedStaff, setSelectedStaff] =
        useState<Staff | null>(null);

    const [confirmStaff, setConfirmStaff] =
        useState<Staff | null>(null);

    /* ================= FETCH ================= */

    const fetchStaff = () => {
        if (!orgId) return;

        setLoading(true);

        getStaffByOrg(orgId)
            .then(setStaff)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchStaff();
    }, [orgId]);

    /* ================= STATUS TOGGLE ================= */

    const toggleStaffStatus = async (staffMember: Staff) => {
        if (!orgId) return;

        try {
            await updateStaff({
                staffId: staffMember.staffId,
                orgId,
                isActive: !staffMember.isActive,
            });

            toast.success(
                staffMember.isActive
                    ? "Staff suspended"
                    : "Staff activated"
            );

            fetchStaff();
        } catch (error: any) {
            toast.error(error?.message || "Failed to update status");
        }
    };

    /* ================= FILTER ================= */

    const filteredStaff = useMemo(() => {
        return staff.filter((s) => {
            const matchesSearch = s.staffName
                .toLowerCase()
                .includes(search.toLowerCase());

            const isActive = s.isActive !== false;

            const matchesFilter =
                filterStatus === "all"
                    ? true
                    : filterStatus === "active"
                        ? isActive
                        : !isActive;

            return matchesSearch && matchesFilter;
        });
    }, [staff, search, filterStatus]);

    /* ================= COUNTS ================= */

    const TOTAL = staff.length;
    const ACTIVE_COUNT = staff.filter(
        (s) => s.isActive !== false
    ).length;
    const INACTIVE_COUNT = staff.filter(
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
                        <h1 className="text-2xl font-semibold">
                            Staff
                        </h1>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-sm">
                            {TOTAL}
                        </span>
                    </div>

                    <Button
                        className="gap-2 bg-primary"
                        onClick={() => {
                            setSelectedStaff(null);
                            setFormMode("add");
                            setSidebarOpen(true);
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        Add Staff
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
                            placeholder="Search staff..."
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
                                    <TableHead>Designation</TableHead>
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
                                            Loading staff...
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading &&
                                    filteredStaff.map((s) => (
                                        <TableRow
                                            key={s.staffId}
                                            className={
                                                s.isActive === false
                                                    ? "opacity-60"
                                                    : ""
                                            }
                                        >
                                            <TableCell className="font-medium">
                                                {s.staffName}
                                            </TableCell>

                                            <TableCell>
                                                {s.staffDesignation}
                                            </TableCell>

                                            <TableCell>
                                                {s.staffPhone}
                                            </TableCell>

                                            <TableCell>
                                                {s.rfidCode ?? (
                                                    <Badge variant="destructive">
                                                        Invalid
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {s.isActive ? (
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
                                                {timeAgo(s.updatedAt)}
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
                                                                setSelectedStaff(s);
                                                                setFormMode("edit");
                                                                setSidebarOpen(true);
                                                            }}
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            className={
                                                                s.isActive === false
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                            }
                                                            onClick={() =>
                                                                setConfirmStaff(s)
                                                            }
                                                        >
                                                            <Ban className="mr-2 h-4 w-4" />
                                                            {s.isActive === false
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
                            <FieldLabel>Rows per page</FieldLabel>
                            <Select defaultValue="25">
                                <SelectTrigger className="w-20">
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

            {/* Sidebar Form */}
            <AddStaffForm
                open={sidebarOpen}
                onOpenChange={setSidebarOpen}
                mode={formMode}
                staff={selectedStaff}
                onSuccess={fetchStaff}
            />

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={!!confirmStaff}
                title={
                    confirmStaff?.isActive === false
                        ? "Activate Staff"
                        : "Suspend Staff"
                }
                description={
                    confirmStaff?.isActive === false
                        ? "This staff member will become active again."
                        : "This staff member will be suspended."
                }
                confirmText={
                    confirmStaff?.isActive === false
                        ? "Activate"
                        : "Suspend"
                }
                onCancel={() => setConfirmStaff(null)}
                onConfirm={() => {
                    if (confirmStaff) {
                        toggleStaffStatus(confirmStaff);
                        setConfirmStaff(null);
                    }
                }}
            />
        </>
    );
};

export default StaffPage;
