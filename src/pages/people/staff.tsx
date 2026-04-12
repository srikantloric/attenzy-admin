import { useEffect, useState } from "react";
import type { StaffProfile, User } from "@/types/users";
import { getUsersByOrg, updateUser } from "@/api/users";
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
import DataPagination from "@/components/Pagination";

import { useFilterPagination } from "@/hooks/useFilterPagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

type FormMode = "add" | "edit";

const StaffPage: React.FC = () => {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("add");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmUser, setConfirmUser] = useState<User | null>(null);

  const navigate = useNavigate();

  /* ================= FETCH ================= */

  const fetchUsers = () => {
    if (!orgId) return;

    setLoading(true);

    getUsersByOrg(orgId)
      .then((data) => {
        const staff = data.filter((u: User) => u.userType === "STAFF");
        setUsers(staff);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [orgId]);

  /* ================= FILTER + PAGINATION ================= */

  const {
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    filteredData,
    paginatedData,
  } = useFilterPagination<User>({
    data: users,
    searchKey: "name",
    getIsActive: (u) => u.isActive !== false,
  });

  /* ================= STATUS TOGGLE ================= */

  const toggleUserStatus = async (user: User) => {
    if (!orgId) return;

    try {
      await updateUser(orgId, user.userId, {
        isActive: !user.isActive,
      });

      toast.success(user.isActive ? "Staff suspended" : "Staff activated");

      fetchUsers();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update status");
    }
  };

  /* ================= COUNTS ================= */

  const TOTAL = users.length;
  const ACTIVE_COUNT = users.filter((u) => u.isActive !== false).length;
  const INACTIVE_COUNT = users.filter((u) => u.isActive === false).length;

  /* ================= RENDER ================= */

  return (
    <>
      <div className="space-y-6 p-6">
        <AppBreadcrumb />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Staff</h1>
            <span className="rounded-md bg-muted px-2 py-0.5 text-sm">
              {TOTAL}
            </span>
          </div>

          <Button
            className="gap-2 bg-primary"
            // onClick={() => {
            //   setSelectedUser(null);
            //   setFormMode("add");
            //   setSidebarOpen(true);
            // }}
            onClick={() =>
              navigate("/add-people", {
                state: { userType: "STAFF" },
              })
            }
          >
            <Plus className="h-4 w-4" />
            Add Staff
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

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
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
                  <TableHead className="text-right">Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading staff...
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
                        
                        <div className="flex flex-col">
                          <p className="font-bold">{user.name.toUpperCase()}</p>
                          <p className="text-foreground text-xs font-normal">
                            {user.userId}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        {(user.profile as StaffProfile)?.designation}
                      </TableCell>

                      <TableCell>{user.phone}</TableCell>

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
                            navigate(`/staff/${user.userId}`);
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

          <DataPagination
            totalItems={filteredData.length}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
          />
        </Card>
      </div>

      {/* Sidebar Form */}
      <AddUserForm
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        mode={formMode}
        user={selectedUser}
        onSuccess={fetchUsers}
        defaultUserType="STAFF"
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmUser}
        title={
          confirmUser?.isActive === false ? "Activate Staff" : "Suspend Staff"
        }
        description="Are you sure?"
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

export default StaffPage;
