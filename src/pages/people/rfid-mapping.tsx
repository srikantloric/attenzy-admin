import { useEffect, useMemo, useState } from "react";
import { AssignRFIDSidebar } from "@/components/rfid/AssignRFIDSidebar";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Check, Save, Loader2 } from "lucide-react";

import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";

import type { User, UserType } from "@/types/users";
import { assignOrUpdateRFID, getUsersByOrg } from "@/api/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFilterPagination } from "@/hooks/useFilterPagination";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const RFIDMappingPage: React.FC = () => {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<UserType>("STUDENT");
  const [assignOpen, setAssignOpen] = useState(false);
  const [rfidInputs, setRfidInputs] = useState<Record<string, string>>({});
  const [savingRows, setSavingRows] = useState<Record<string, boolean>>({});
  const [studentClassFilter, setStudentClassFilter] = useState("ALL");

  useEffect(() => {
    if (!orgId) return;

    const fetchUsers = async () => {
      try {
        const data = await getUsersByOrg(orgId);
        setUsers(data);
      } catch {
        toast.error("Failed to load users");
      }
    };

    fetchUsers();
  }, [orgId]);

  useEffect(() => {
    const inputDefaults = users.reduce<Record<string, string>>((acc, current) => {
      acc[current.userId] = current.rfidCode ?? "";
      return acc;
    }, {});

    setRfidInputs(inputDefaults);
  }, [users]);

  const handleInlineRFIDSave = async (user: User) => {
    if (!orgId) return;

    const rawValue = rfidInputs[user.userId] ?? "";
    const nextRfid = rawValue.trim();

    if (!nextRfid) {
      toast.warning("RFID is required");
      return;
    }

    if (nextRfid === (user.rfidCode ?? "")) return;

    setSavingRows((prev) => ({ ...prev, [user.userId]: true }));

    try {
      const res = await assignOrUpdateRFID(orgId, user.userId, nextRfid);

      setUsers((prev) =>
        prev.map((current) =>
          current.userId === user.userId
            ? { ...current, rfidCode: nextRfid }
            : current
        )
      );

      setRfidInputs((prev) => ({ ...prev, [user.userId]: nextRfid }));
      toast.success(res.message || "RFID saved");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save RFID");
    } finally {
      setSavingRows((prev) => ({ ...prev, [user.userId]: false }));
    }
  };

  const tabFilteredUsers = useMemo(() => {
    const byType = users.filter((u) => u.userType === activeTab);

    if (activeTab !== "STUDENT" || studentClassFilter === "ALL") {
      return byType;
    }

    return byType.filter(
      (u) => "class" in u.profile && u.profile.class === studentClassFilter
    );
  }, [users, activeTab, studentClassFilter]);

  const studentClassOptions = useMemo(() => {
    const classes = users
      .filter((u) => u.userType === "STUDENT")
      .map((u) => u.profile.class)
      .filter((v): v is string => Boolean(v && v.trim()));

    return Array.from(new Set(classes)).sort((a, b) => a.localeCompare(b));
  }, [users]);

  const {
    search,
    setSearch,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    filteredData,
    paginatedData,
  } = useFilterPagination<User>({
    data: tabFilteredUsers,
    searchKey: "name",
    getIsActive: (u) => u.isActive !== false,
  });

  if (!orgId) return null;

  const totalByType = (type: UserType) =>
    users.filter((u) => u.userType === type).length;

  const stats = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        acc.totalUsers++;

        if (user.userType === "STUDENT") acc.totalStudents++;

        if (user.userType === "FACULTY") acc.totalFaculty++;

        if (user.userType === "STAFF") acc.totalStaff++;

        return acc;
      },
      {
        totalUsers: 0,
        totalStudents: 0,
        totalFaculty: 0,
        totalStaff: 0,
      }
    );
  }, [users]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 3) pages.push("...");

      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">User RFID Mapping</h1>

          <Button
            className="gap-2 bg-primary"
            onClick={() => setAssignOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Assign RFID
          </Button>
        </div>

        {/* Meta */}
        <div className="text-sm text-muted-foreground">
          Students:{" "}
          <span className="text-primary font-medium">
            {stats.totalStudents}
          </span>
          <span className="ml-4">
            Faculty:{" "}
            <span className="text-primary font-medium">
              {stats.totalFaculty}
            </span>
          </span>
          <span className="ml-4">
            Staff:{" "}
            <span className="text-primary font-medium">{stats.totalStaff}</span>
          </span>
        </div>

        <Separator />

        {/* Tabs */}
        <div className="flex gap-2">
          {(["STUDENT", "FACULTY", "STAFF"] as UserType[]).map((type) => (
            <Button
              key={type}
              size="sm"
              variant={activeTab === type ? "default" : "outline"}
              onClick={() => setActiveTab(type)}
            >
              {type}
              <Badge variant="secondary" className="ml-2">
                {totalByType(type)}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {activeTab === "STUDENT" && (
            <Select
              value={studentClassFilter}
              onValueChange={(value) => {
                setStudentClassFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">All Classes</SelectItem>

                {studentClassOptions.map((className) => (
                  <SelectItem key={className} value={className}>
                    {className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Table */}
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>

                  {/* Dynamic Column */}
                  {activeTab === "STUDENT" && (
                    <>
                      <TableHead>Class</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Roll No</TableHead>
                    </>
                  )}

                  {activeTab === "FACULTY" && (
                    <>
                      <TableHead>Department</TableHead>
                      <TableHead>Subjects</TableHead>
                    </>
                  )}

                  {activeTab === "STAFF" && (
                    <>
                      <TableHead>Department</TableHead>
                      <TableHead>Designation</TableHead>
                    </>
                  )}

                  <TableHead>RFID</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedData.map((user) => (
                  <TableRow key={user.userId}>
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

                    <TableCell>{user.phone}</TableCell>

                    {/* Student */}
                    {user.userType === "STUDENT" && (
                      <>
                        <TableCell>{user.profile.class}</TableCell>
                        <TableCell>{user.profile.section}</TableCell>
                        <TableCell>{user.profile.rollNumber}</TableCell>
                      </>
                    )}

                    {/* Faculty */}
                    {user.userType === "FACULTY" && (
                      <>
                        <TableCell>{user.profile.department}</TableCell>
                        <TableCell>{user.profile.subjects}</TableCell>
                      </>
                    )}

                    {/* Staff */}
                    {user.userType === "STAFF" && (
                      <>
                        <TableCell>{user.profile.department}</TableCell>
                        <TableCell>{user.profile.designation}</TableCell>
                      </>
                    )}

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Enter RFID"
                          className="w-36"
                          value={rfidInputs[user.userId] ?? ""}
                          onChange={(e) =>
                            setRfidInputs((prev) => ({
                              ...prev,
                              [user.userId]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              void handleInlineRFIDSave(user);
                            }
                          }}
                          disabled={Boolean(savingRows[user.userId])}
                        />

                        {(() => {
                          const isSaving = Boolean(savingRows[user.userId]);
                          const currentValue = (rfidInputs[user.userId] ?? "").trim();
                          const savedValue = user.rfidCode ?? "";
                          const hasSavedRFID = Boolean(savedValue);
                          const isChanged = currentValue !== savedValue;

                          if (isSaving) {
                            return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
                          }

                          if (!isChanged && hasSavedRFID) {
                            return <Check className="h-4 w-4 text-green-600" />;
                          }

                          return (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => void handleInlineRFIDSave(user)}
                              disabled={!currentValue || !isChanged}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          );
                        })()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          <Separator />

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
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {/* Pages */}
              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <PaginationItem key={index}>
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
              )}

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
        </Card>
      </div>

      <AssignRFIDSidebar
        open={assignOpen}
        onOpenChange={setAssignOpen}
        orgId={orgId}
      />
    </>
  );
};

export default RFIDMappingPage;
