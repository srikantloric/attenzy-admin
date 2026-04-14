import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { listGrades } from "@/api/academics";
import { getUsersByOrg } from "@/api/users";
import {
  getAttendanceCalendarView,
  updateManualAttendance,
  type ManualAttendanceUpdateResponse,
} from "@/api/attendance";
import type { AttendanceStatus } from "@/types/attendance";
import type { AttendanceStatus as CalendarAttendanceStatus } from "@/types/reports/attendance";
import type { User, UserType } from "@/types/users";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Calendar } from "@/components/ui/calendar";

import { CheckCircle2, Search, Save } from "lucide-react";
import type { AcademicItem } from "@/types/academics";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ManualAttendanceRow {
  id: string;
  profile: string;
  name: string;
  userType: UserType;
  groupLabel: string;
  status: AttendanceStatus;
  reason: string;
  alreadyMarked: boolean;
}

const STATUS_OPTIONS: AttendanceStatus[] = [
  "PRESENT",
  "ABSENT",
  "LEAVE",
  "HALF_DAY",
];

const STATUS_LEGEND: Array<{ short: string; label: AttendanceStatus }> = [
  { short: "P", label: "PRESENT" },
  { short: "A", label: "ABSENT" },
  { short: "L", label: "LEAVE" },
  { short: "H", label: "HALF_DAY" },
];

const MAX_UPDATES_PER_REQUEST = 200;

const mapCalendarStatusToManualStatus = (
  status: CalendarAttendanceStatus
): AttendanceStatus => {
  if (status === "HOLIDAY") {
    return "HALF_DAY";
  }

  return status;
};

const getGroupLabel = (user: User): string => {
  if (user.userType === "STUDENT") {
    const className = user.profile?.class || "UNASSIGNED";
    const section = user.profile?.section ? `-${user.profile.section}` : "";
    return `${className}${section}`;
  }

  return user.userType;
};

const mapUserToRow = (user: User): ManualAttendanceRow => ({
  id: user.userId,
  profile: user.profilePhoto || "",
  name: user.name,
  userType: user.userType,
  groupLabel: getGroupLabel(user),
  status: "PRESENT",
  reason: "",
  alreadyMarked: false,
});

const getCountsFromResponse = (response: ManualAttendanceUpdateResponse) => {
  if (
    typeof response.successCount === "number" &&
    typeof response.failedCount === "number"
  ) {
    return {
      success: response.successCount,
      failed: response.failedCount,
    };
  }

  const resultItems = Array.isArray(response.results) ? response.results : [];

  return {
    success: resultItems.filter((item) => item.ok).length,
    failed: resultItems.filter((item) => !item.ok).length,
  };
};

const applyPrefilledStatuses = (
  rows: ManualAttendanceRow[],
  statusByUserId: Map<string, AttendanceStatus>
): { updatedRows: ManualAttendanceRow[]; markedCount: number } => {
  let markedCount = 0;

  const updatedRows: ManualAttendanceRow[] = rows.map(
    (row): ManualAttendanceRow => {
      const existingStatus = statusByUserId.get(row.id);

      if (existingStatus) {
        markedCount += 1;
        return {
          ...row,
          status: existingStatus,
          alreadyMarked: true,
        };
      }

      return {
        ...row,
        status: "PRESENT",
        reason: "",
        alreadyMarked: false,
      };
    }
  );

  return { updatedRows, markedCount };
};

const ManualAttendancePage = () => {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<ManualAttendanceRow[]>([]);
  const [selectedUserType, setSelectedUserType] = useState<UserType>("STUDENT");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [gradeOptions, setGradeOptions] = useState<AcademicItem[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingPrefill, setLoadingPrefill] = useState(false);
  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const visibleByUserType = useMemo(() => {
    return records.filter((record) => record.userType === selectedUserType);
  }, [records, selectedUserType]);

  const activeGradeOptions = useMemo(
    () => gradeOptions.filter((grade) => grade.isActive),
    [gradeOptions]
  );

  useEffect(() => {
    if (selectedUserType !== "STUDENT") {
      setSelectedClass("");
    }
  }, [selectedUserType]);

  useEffect(() => {
    if (selectedUserType !== "STUDENT") {
      return;
    }

    if (activeGradeOptions.length === 0) {
      setSelectedClass("");
      return;
    }

    setSelectedClass((current) =>
      activeGradeOptions.some((grade) => grade.name === current)
        ? current
        : activeGradeOptions[0].name
    );
  }, [activeGradeOptions, selectedUserType]);

  const visibleByClass = useMemo(() => {
    if (selectedUserType !== "STUDENT") {
      return visibleByUserType;
    }

    if (!selectedClass) {
      return [];
    }

    return visibleByUserType.filter((record) =>
      record.groupLabel.startsWith(selectedClass)
    );
  }, [selectedClass, selectedUserType, visibleByUserType]);

  const filteredRecords = useMemo(() => {
    return visibleByClass.filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [visibleByClass, search]);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRecords.slice(start, start + rowsPerPage);
  }, [filteredRecords, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);

  const markedVisibleCount = useMemo(
    () => visibleByClass.filter((record) => record.alreadyMarked).length,
    [visibleByClass]
  );

  const prefillAttendanceForDate = async (
    sourceRows: ManualAttendanceRow[]
  ): Promise<ManualAttendanceRow[]> => {
    if (!orgId || !date || sourceRows.length === 0) {
      return sourceRows;
    }

    setLoadingPrefill(true);
    try {
      const month = format(date, "yyyy-MM");
      const day = format(date, "dd");
      const calendarView = await getAttendanceCalendarView(orgId, month);

      const statusByUserId = new Map<string, AttendanceStatus>();

      calendarView.users.forEach((calendarUser) => {
        const status = calendarUser.attendance?.[day];
        if (status) {
          statusByUserId.set(
            calendarUser.userId,
            mapCalendarStatusToManualStatus(status)
          );
        }
      });

      const { updatedRows } = applyPrefilledStatuses(
        sourceRows,
        statusByUserId
      );
      return updatedRows;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to prefill attendance status"
      );
      return sourceRows.map((row) => ({
        ...row,
        status: "PRESENT" as AttendanceStatus,
        reason: "",
        alreadyMarked: false,
      }));
    } finally {
      setLoadingPrefill(false);
    }
  };

  const loadUsers = async () => {
    if (!orgId) {
      toast.error("Organization context is missing");
      return;
    }

    if (selectedUserType === "STUDENT" && !selectedClass) {
      return;
    }

    setLoadingUsers(true);
    try {
      const users = await getUsersByOrg(orgId, {
        userType: selectedUserType,
        classId: selectedUserType === "STUDENT" ? selectedClass : undefined,
        grade: selectedUserType === "STUDENT" ? selectedClass : undefined,
      });

      const nextRecords = await prefillAttendanceForDate(
        users.map(mapUserToRow)
      );
      setRecords(nextRecords);

      if (nextRecords.length === 0) {
        toast.warning("No users found for this organization");
      } else {
        toast.success(`Loaded ${nextRecords.length} users`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load users"
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const fetchGrades = async () => {
      if (!orgId) return;

      setLoadingGrades(true);
      try {
        const grades = await listGrades(orgId);
        const configuredGrades = grades.filter((grade) => grade.isActive);
        setGradeOptions(configuredGrades);

        if (configuredGrades.length === 0) {
          toast.warning(
            "No active grades are configured for this organization"
          );
          return;
        }

        setSelectedClass((current) =>
          current && configuredGrades.some((grade) => grade.name === current)
            ? current
            : configuredGrades[0].name
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load grades"
        );
      } finally {
        setLoadingGrades(false);
      }
    };

    void fetchGrades();
  }, [orgId]);

  useEffect(() => {
    if (!orgId) {
      return;
    }

    void loadUsers();
  }, [orgId, selectedUserType, selectedClass]);

  useEffect(() => {
    if (!date || records.length === 0) {
      return;
    }

    void (async () => {
      const updatedRows = await prefillAttendanceForDate(records);
      setRecords(updatedRows);
    })();
  }, [date]);

  const updateStatus = (id: string, status: AttendanceStatus) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const updateReason = (id: string, reason: string) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, reason } : r)));
  };

  const saveAttendance = async () => {
    if (!orgId) {
      toast.error("Organization context is missing");
      return;
    }

    if (!date) {
      toast.error("Please select a date");
      return;
    }

    if (visibleByClass.length === 0) {
      toast.error("No records available to save");
      return;
    }

    const updates = visibleByClass.map((record) => {
      const trimmedReason = record.reason.trim();
      return {
        userId: record.id,
        status: record.status,
        ...(trimmedReason ? { reason: trimmedReason } : {}),
      };
    });

    const dateString = format(date, "yyyyMMdd");

    setSaving(true);
    try {
      let success = 0;
      let failed = 0;

      for (let i = 0; i < updates.length; i += MAX_UPDATES_PER_REQUEST) {
        const chunk = updates.slice(i, i + MAX_UPDATES_PER_REQUEST);
        const response = await updateManualAttendance(orgId, {
          date: dateString,
          updates: chunk,
        });

        const chunkCounts = getCountsFromResponse(response);
        success += chunkCounts.success;
        failed += chunkCounts.failed;
      }

      if (failed === 0) {
        toast.success(
          `Manual attendance updated for ${success} user${
            success === 1 ? "" : "s"
          }`
        );
      } else {
        toast.warning(
          `Manual attendance updated with ${success} success and ${failed} failures`
        );
      }

      const refreshedRows = await prefillAttendanceForDate(records);
      setRecords(refreshedRows);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save manual attendance"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Mark Attendance
        </h1>
        <p className="text-sm text-muted-foreground">
          Mark attendance manually for students / faculty / staff
        </p>
      </div>

      {/* <Separator /> */}

      {/* Main Layout */}
      <div className="flex gap-6">
        {/* LEFT SIDE */}
        <Card className="flex-1">
          <CardContent className="space-y-4 p-4">
            {/* Search + Save */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search user"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Button
                size="sm"
                className="gap-2 bg-primary"
                onClick={saveAttendance}
                disabled={
                  saving ||
                  loadingUsers ||
                  loadingGrades ||
                  loadingPrefill ||
                  visibleByClass.length === 0
                }
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Attendance already marked for {markedVisibleCount} of{" "}
              {visibleByClass.length} shown user
              {visibleByClass.length === 1 ? "" : "s"}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Legend:</span>
              {STATUS_LEGEND.map((legend) => (
                <span
                  key={legend.label}
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1"
                >
                  <span className="font-semibold text-foreground">
                    {legend.short}
                  </span>
                  <span>{legend.label}</span>
                </span>
              ))}
            </div>

            {/* Attendance Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason (Optional)</TableHead>
                  <TableHead>Marked</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedRecords.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      {loadingUsers || loadingPrefill
                        ? "Loading users..."
                        : "No records found"}
                    </TableCell>
                  </TableRow>
                )}

                {paginatedRecords.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <img
                        src={user.profile}
                        alt={user.name}
                        className="h-10 w-10 rounded-sm  object-cover"
                      />
                    </TableCell>
                    <TableCell>{user.id}</TableCell>

                    <TableCell className="font-medium">{user.name}</TableCell>

                    <TableCell>{user.groupLabel}</TableCell>

                    <TableCell>
                      <div className="flex gap-1">
                        {STATUS_OPTIONS.map((status) => {
                          const active = user.status === status;
                          return (
                            <Button
                              key={status}
                              size="sm"
                              variant="outline"
                              className={
                                active
                                  ? "bg-primary text-primary-foreground border-primary hover:bg-primary"
                                  : ""
                              }
                              onClick={() => updateStatus(user.id, status)}
                            >
                              {status.charAt(0).toUpperCase()}
                            </Button>
                          );
                        })}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Input
                        placeholder="Reason"
                        value={user.reason}
                        onChange={(e) => updateReason(user.id, e.target.value)}
                      />
                    </TableCell>

                    <TableCell>
                      {user.alreadyMarked ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>

          <Separator />

          <div className="py-4">
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === page}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
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
          </div>
        </Card>

        {/* RIGHT SIDE */}
        <Card className="w-75">
          <CardContent className="space-y-4 p-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select User Type</label>
              <Select
                value={selectedUserType}
                onValueChange={(value) =>
                  setSelectedUserType(value as UserType)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Students</SelectItem>
                  <SelectItem value="FACULTY">Faculty</SelectItem>
                  <SelectItem value="STAFF">Staffs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Class Select */}
            {selectedUserType === "STUDENT" &&
              activeGradeOptions.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Grade</label>
                  <Select
                    value={selectedClass}
                    onValueChange={setSelectedClass}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {activeGradeOptions.map((grade) => (
                        <SelectItem
                          key={grade.gradeId ?? grade.name}
                          value={grade.name}
                        >
                          {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

            {selectedUserType === "STUDENT" &&
              activeGradeOptions.length === 0 && (
                <div className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
                  No active grades are configured.
                </div>
              )}

            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date</label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </div>

            <div className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
              Users load automatically for the selected user type and grade.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManualAttendancePage;
