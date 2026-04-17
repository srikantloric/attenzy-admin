"use client";

import React, { useEffect, useMemo, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { getAttendanceByOrg } from "@/api/attendance";
import type { AttendanceItem } from "@/types/attendance";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumb } from "@/components/AppBreadCrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const AttendanceRow = React.memo(({ record }: { record: AttendanceItem }) => {
  return (
    <TableRow>
      <TableCell className="flex items-center gap-3">
        <Avatar>
          <AvatarImage
            src={record.profilePhoto || ""}
            alt={record.userName}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "";
            }}
          />
          <AvatarFallback>
            {record.userName?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <p className="font-medium">{record.userName}</p>
          <p className="text-xs text-muted-foreground">{record.userId}</p>
        </div>
      </TableCell>

      <TableCell>
        {record.userType === "STUDENT"
          ? `${record.userProfile.class} - ${record.userProfile.section}`
          : record.userProfile.department}
      </TableCell>

      <TableCell>{record.deviceName}</TableCell>
      <TableCell>{new Date(record.timestamp).toLocaleTimeString()}</TableCell>

      <TableCell>
        <Badge className="bg-green-100 text-green-700">Present</Badge>
      </TableCell>
    </TableRow>
  );
});

const IotAttendance: React.FC = () => {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const [attendance, setAttendance] = useState<AttendanceItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [search, setSearch] = useState("");
  const [filterStatus, _] = useState<"all">("all");

  const [classFilter, setClassFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const selectedDateKey = useMemo(() => {
    return format(selectedDate, "yyyyMMdd");
  }, [selectedDate]);

  // Fetch with silent mode
  const fetchAttendance = async (date: string, isSilent = false) => {
    if (!orgId) return;

    try {
      if (!isSilent) setLoading(true);

      const data = await getAttendanceByOrg(orgId, date);

      setAttendance((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(data)) {
          return prev;
        }
        return data;
      });
    } catch (err) {
      console.error(err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedDateKey);
  }, [orgId, selectedDateKey]);

  // Silent auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAttendance(selectedDateKey, true);
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, orgId, selectedDateKey]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, classFilter, userTypeFilter, selectedDateKey]);

  const availableClasses = useMemo(() => {
    const set = new Set(attendance.map((a) => a.userProfile.class));
    return ["all", ...Array.from(set)];
  }, [attendance]);

  const availableUserTypes = ["all", "STUDENT", "FACULTY", "STAFF"];

  const filteredRecords = useMemo(() => {
    let data = attendance;

    if (classFilter !== "all") {
      data = data.filter((a) => a.userProfile.class === classFilter);
    }

    if (userTypeFilter !== "all") {
      data = data.filter((a) => a.userType?.toUpperCase() === userTypeFilter);
    }

    if (search) {
      data = data.filter((a) =>
        a.userName.toLowerCase().includes(search.toLowerCase())
      );
    }

    return [...data].sort((a, b) => b.timestamp - a.timestamp);
  }, [attendance, filterStatus, classFilter, userTypeFilter, search]);

  // Paginate the filtered records
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRecords.slice(start, start + rowsPerPage);
  }, [filteredRecords, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);

  // Adjust current page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [filteredRecords.length, rowsPerPage]);

  const totalPunches = filteredRecords.length;

  const uniqueStudents = useMemo(() => {
    const set = new Set(filteredRecords.map((r) => r.userId));
    return set.size;
  }, [filteredRecords]);

  return (
    <div className="flex flex-col gap-6 overflow-hidden p-6">
      <AppBreadcrumb />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Smart Attendance</h1>

        <div className="flex items-center gap-3">
          {autoRefresh && (
            <span className="text-xs text-muted-foreground">
              Live updating…
            </span>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Total Punches
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {totalPunches}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Unique Students
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {uniqueStudents}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-3 items-center">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-37.5">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              {availableClasses.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  {cls === "all" ? "All Classes" : cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="User Type" />
            </SelectTrigger>
            <SelectContent>
              {availableUserTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === "all" ? "All Types" : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8 w-64"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="flex h-185 flex-col ">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Attendance Logs</CardTitle>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Auto Refresh</span>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 ">
          <ScrollArea className="h-full w-full min-h-75">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entity</TableHead>
                  <TableHead>Class/Department</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading attendance...
                    </TableCell>
                  </TableRow>
                )}

                {!loading && filteredRecords.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-6"
                    >
                      No data is available for this date
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  paginatedData.length > 0 &&
                  paginatedData.map((record) => (
                    <AttendanceRow
                      key={`${record.userId}-${record.timestamp}`}
                      record={record}
                    />
                  ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>

        <Separator />

        {filteredRecords.length > 0 && (
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

              {/* Pages with ellipsis */}
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
        )}
      </Card>
    </div>
  );
};

export default IotAttendance;
