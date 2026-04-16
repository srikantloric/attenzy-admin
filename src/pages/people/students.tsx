import { useEffect, useState } from "react";
import type { StudentProfile, User } from "@/types/users";
import { getStudentsByClass, updateUser } from "@/api/users";
import { listGrades, listSections } from "@/api/academics";
import type { AcademicItem } from "@/types/academics";
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

import { Search, Plus, MoreVertical, Ban, Pencil, Eye } from "lucide-react";

import { AppBreadcrumb } from "@/components/AppBreadCrumb";
import { timeAgo } from "@/utils/timeAgo";
import useAuth from "@/hooks/useAuth";

import AddUserForm from "@/components/people/AddUserForm";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import { useFilterPagination } from "@/hooks/useFilterPagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormMode = "add" | "edit";

const StudentsPage: React.FC = () => {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("add");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmUser, setConfirmUser] = useState<User | null>(null);

  const [grades, setGrades] = useState<AcademicItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("LKG");

  const [sections, setSections] = useState<AcademicItem[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("all");

  const navigate = useNavigate();

  /* ================= FETCH ================= */

  const fetchUsers = async () => {
    if (!orgId) return;

    setLoading(true);

    try {
      const data = await getStudentsByClass(
        orgId,
        "STUDENT",
        selectedClass,
        selectedSection
      );

      setUsers(data);

      const classText = selectedClass === "all" ? "All Classes" : selectedClass;

      const sectionText =
        selectedSection === "all" ? "All Sections" : selectedSection;

      toast.dismiss();

      toast.success(
        `${data.length} users loaded for ${classText} - ${sectionText}`
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    if (!orgId) return;

    try {
      const data = await listGrades(orgId);
      setGrades(data);
    } catch (err) {
      console.error("Failed to fetch grades", err);
    }
  };

  const fetchSections = async () => {
    if (!orgId) return;

    try {
      const data = await listSections(orgId);
      setSections(data);
    } catch (err) {
      console.error("Failed to fetch sections", err);
    }
  };

  useEffect(() => {
    if (!orgId) return;

    fetchGrades();
    fetchSections();
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;

    fetchUsers();
  }, [orgId, selectedClass, selectedSection]);

  /* ================= FILTER + PAGINATION ================= */

  const {
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    filteredData,
    paginatedData,
  } = useFilterPagination<User>({
    data: users,
    searchKey: "name",
    getIsActive: (u) => u.isActive !== false,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, users]);

  useEffect(() => {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [filteredData, rowsPerPage]);

  /* ================= STATUS TOGGLE ================= */

  const toggleUserStatus = async (user: User) => {
    if (!orgId) return;

    try {
      await updateUser(orgId, user.userId, {
        isActive: !user.isActive,
      });

      toast.success(user.isActive ? "Student suspended" : "Student activated");

      fetchUsers();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update status");
    }
  };

  /* ================= COUNTS ================= */

  const TOTAL = users.length;
  const ACTIVE_COUNT = users.filter((u) => u.isActive !== false).length;
  const INACTIVE_COUNT = users.filter((u) => u.isActive === false).length;

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  /* ================= RENDER ================= */

  return (
    <>
      <div className="space-y-6 lg:p-6 md:p-3">
        <AppBreadcrumb />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Students</h1>
            <span className="rounded-md bg-muted px-2 py-0.5 text-sm">
              {TOTAL}
            </span>
          </div>

          <Button
            className="gap-2 bg-primary"
            // onClick={() => {
            //   setFormMode("add");
            //   setSelectedUser(null);
            //   setSidebarOpen(true);
            // }}
            onClick={() => navigate("/add-people")}
          >
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
        </div>

        {/* Meta */}
        <div className="text-sm text-muted-foreground">
          Active:{" "}
          <span className="text-green-600 font-medium">{ACTIVE_COUNT}</span>
          <span className="ml-4">
            Inactive: <span className="font-medium">{INACTIVE_COUNT}</span>
          </span>
        </div>

        <Separator />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* LEFT SIDE → STATUS */}
          <div className="flex gap-2 items-center flex-wrap">
            {(["all", "active", "inactive"] as const).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={filterStatus === status ? "default" : "outline"}
                onClick={() => setFilterStatus(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>

          {/* RIGHT SIDE → CLASS + SEARCH */}
          <div className="flex items-center gap-2">
            {/* CLASS */}
            <Select
              value={selectedClass}
              onValueChange={(value) => {
                setSelectedClass(value);
                setSelectedSection("all");
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] h-9 text-sm">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {grades.map((grade) => (
                  <SelectItem
                    key={grade.gradeId ?? grade.name}
                    value={grade.name}
                  >
                    {grade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* SECTION */}
            <Select
              value={selectedSection}
              onValueChange={(value) => {
                setSelectedSection(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] h-9 text-sm">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sections.map((sec) => (
                  <SelectItem key={sec.sectionId ?? sec.name} value={sec.name}>
                    {sec.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* SEARCH */}
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8 w-full"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
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
                  <TableHead className="text-right">Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading students...
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  paginatedData.map((user) => (
                    <TableRow
                      key={user.userId}
                      className={user.isActive === false ? "opacity-60" : ""}
                    >
                      <TableCell className="flex gap-2 items-center">
                        <Avatar>
                          <AvatarImage
                            src={user.profilePhoto || ""}
                            alt={user.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "";
                            }}
                          />
                          <AvatarFallback>
                            {user.name?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col items-start">
                          <p className="font-bold">{user.name.toUpperCase()}</p>
                          <Button
                            variant={"link"}
                            onClick={() => {
                              navigate(user.userId);
                            }}
                            className="p-0 text-xs m-0 text-gray-500 h-5"
                          >
                            {user.userId}
                          </Button>
                        </div>
                      </TableCell>

                      <TableCell>{user.phone}</TableCell>

                      <TableCell>
                        {(user.profile as StudentProfile)?.class}/
                        {(user.profile as StudentProfile)?.section}
                      </TableCell>

                      <TableCell>
                        {user.rfidCode ?? (
                          <Badge variant="destructive">Invalid</Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        {user.isActive !== false ? (
                          <Badge className="bg-green-100 text-green-700">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        {timeAgo(user.updatedAt)}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant={"ghost"}
                          onClick={() => {
                            navigate(`/students/${user.userId}`);
                          }}
                        >
                          <Eye />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setFormMode("edit");
                                setSidebarOpen(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className={
                                user.isActive === false
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                              onClick={() => setConfirmUser(user)}
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              {user.isActive === false ? "Activate" : "Suspend"}
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

          {filteredData.length > 0 && (
            <>
              <Pagination>
                <PaginationContent>
                  {/* Previous */}
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {/* Page Numbers */}
                  {(() => {
                    const pages: (number | string)[] = [];
                    const total = totalPages;

                    if (total <= 7) {
                      for (let i = 1; i <= total; i++) pages.push(i);
                    } else {
                      pages.push(1);

                      if (currentPage > 3) {
                        pages.push("...");
                      }

                      const start = Math.max(2, currentPage - 1);
                      const end = Math.min(total - 1, currentPage + 1);

                      for (let i = start; i <= end; i++) {
                        pages.push(i);
                      }

                      if (currentPage < total - 2) {
                        pages.push("...");
                      }

                      pages.push(total);
                    }

                    return pages.map((page, index) =>
                      page === "..." ? (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            isActive={currentPage === page}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(Number(page));
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    );
                  })()}

                  {/* Next */}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages)
                          setCurrentPage(currentPage + 1);
                      }}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          )}

          {/* Show message when no data */}
          {!loading && filteredData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No students found
            </div>
          )}
        </Card>
      </div>

      {/* Sidebar Form */}
      <AddUserForm
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        mode={formMode}
        user={selectedUser}
        onSuccess={fetchUsers}
        defaultUserType="STUDENT"
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmUser}
        title={
          confirmUser?.isActive === false
            ? "Activate Student"
            : "Suspend Student"
        }
        description={
          confirmUser?.isActive === false
            ? "This student will become active again."
            : "This student will be suspended."
        }
        confirmText={confirmUser?.isActive === false ? "Activate" : "Suspend"}
        onCancel={() => setConfirmUser(null)}
        onConfirm={() => {
          if (confirmUser) {
            toggleUserStatus(confirmUser);
            setConfirmUser(null);
          }
        }}
      />
    </>
  );
};

export default StudentsPage;
