import { useEffect, useState } from "react";
import { format } from "date-fns";

import useAuth from "@/hooks/useAuth";
import { listGrades } from "@/api/academics";
import { getAttendanceByOrg } from "@/api/reports/studentAttendance";

import type { AcademicItem } from "@/types/academics";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

import { useFilterPagination } from "@/hooks/useFilterPagination";
import { Separator } from "@/components/ui/separator";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function DailyAttendance() {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const [grades, setGrades] = useState<AcademicItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>();

  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  /* ================= FETCH CLASSES ================= */

  useEffect(() => {
    if (!orgId) return;

    const fetchGrades = async () => {
      try {
        const data = await listGrades(orgId);
        setGrades(data);
      } catch (error) {
        console.error("Failed to fetch grades", error);
      }
    };

    fetchGrades();
  }, [orgId]);

  /* ================= GENERATE ATTENDANCE ================= */

  // handleGenerate
  const handleGenerate = async () => {
    if (!orgId || !selectedClass || !selectedDate) {
      alert("Please select date and class");
      return;
    }

    try {
      setLoading(true);
      setNoData(false);

      const formattedDate = format(selectedDate, "yyyyMMdd");

      const data = await getAttendanceByOrg(
        orgId,
        selectedClass,
        formattedDate
      );

      if (data.length === 0) {
        setNoData(true);
      }

      const result = data.map((item: any) => ({
        userId: item.userId,
        profilePhoto: item.profilePhoto,
        name: item.userName,
        class: item.userProfile?.class,
        section: item.userProfile?.section,
        rollNumber: item.userProfile?.rollNumber,
        firstScan: item.firstScan,
        lastScan: item.lastScan,
        source: item.source,
        status: item.status,
      }));

      setAttendanceData(result);
    } catch (error) {
      console.error("Attendance fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= SUMMARY ================= */

  const total = attendanceData.length;
  const present = attendanceData.filter((a) => a.status === "PRESENT").length;

  const {
    search,
    setSearch,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    filteredData,
    paginatedData,
  } = useFilterPagination({
    data: attendanceData,
    searchKey: "name",
    getIsActive: () => true,
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <div className="py-6 space-y-6">
      {/* ================= FILTER CARD ================= */}

      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-4 items-end">
          {/* DATE PICKER */}

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[180px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />

                {selectedDate ? format(selectedDate, "PPP") : "Select Date"}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* CLASS SELECT */}

          <Select
            value={selectedClass}
            onValueChange={(val) => setSelectedClass(val)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>

            <SelectContent>
              {grades.map((grade) => (
                <SelectItem key={grade.gradeId} value={grade.name}>
                  {grade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* GENERATE BUTTON */}

          <Button type="button" onClick={handleGenerate} className="w-[140px]">
            {loading ? "Loading..." : "Generate"}
          </Button>
        </CardContent>
      </Card>

      {/* ================= NO DATA MESSAGE ================= */}

      {noData && (
        <p className="text-red-500">No data available for this date</p>
      )}

      {/* ================= SUMMARY ================= */}

      {attendanceData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-xl font-bold">{total}</p>{" "}
              {/* was wrongly labeled */}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Present</p>
              <p className="text-xl font-bold text-green-600">{present}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================= TABLE ================= */}

      {attendanceData.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Attendance Details</CardTitle>

            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />

              <Input
                className="pl-8 w-64"
                placeholder="Search student..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>First Scan</TableHead>
                  <TableHead>Last Scan</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Loading attendance...
                    </TableCell>
                  </TableRow>
                )}

                {!loading && paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-6"
                    >
                      No data is available for this date
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  paginatedData.length > 0 &&
                  paginatedData.map((item: any) => (
                    <TableRow key={`${item.userId}-${item.time}`}>
                      <TableCell className="flex gap-2 items-center font-medium min-w-[140px] whitespace-nowrap">
                        <Avatar>
                          <AvatarImage
                            src={item.profilePhoto || ""}
                            alt={item.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "";
                            }}
                          />
                          <AvatarFallback>
                            {item.name?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col items-start">
                          <p className="font-bold">{item.name.toUpperCase()}</p>
                          <span className="text-xs text-muted-foreground">
                            {item.userId}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>{item.class ?? "-"}</TableCell>

                      <TableCell>{item.section ?? "-"}</TableCell>

                      <TableCell>{item.rollNumber ?? "-"}</TableCell>

                      <TableCell>
                        {item.firstScan
                          ? new Date(item.firstScan).toLocaleTimeString()
                          : "-"}
                      </TableCell>

                      <TableCell>
                        {item.lastScan
                          ? new Date(item.lastScan).toLocaleTimeString()
                          : "-"}
                      </TableCell>

                      <TableCell>{item.source ?? "-"}</TableCell>

                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            item.status === "PRESENT"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
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
        </Card>
      )}
    </div>
  );
}
