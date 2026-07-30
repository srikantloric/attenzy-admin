import { useState, useMemo } from "react";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { AlertTriangle, Calendar, CheckIcon, Download, FileSpreadsheet, FileText, XIcon } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import useAuth from "@/hooks/useAuth";
import { getFacultyCalendarView } from "@/api/reports/facultyAttendance";
import type { AttendanceCalendarResponse } from "@/types/reports/attendance";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import attenzyLogo from "@/assets/attenzy-logo-transparent.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function FacultyAttendance() {
  const { user } = useAuth();
  const orgId = user?.orgId ?? "";

  const currentDate = new Date();

  const [month, setMonth] = useState(format(currentDate, "MM"));
  const [year, setYear] = useState(format(currentDate, "yyyy"));

  const [appliedMonth, setAppliedMonth] = useState(month);
  const [appliedYear, setAppliedYear] = useState(year);

  const [data, setData] = useState<AttendanceCalendarResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const monthOptions = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const yearOptions = Array.from({ length: 5 }).map((_, i) =>
    (currentDate.getFullYear() - i).toString(),
  );

  /* ================= FETCH ================= */

  const handleRefresh = async () => {
    if (!orgId) return;

    setLoading(true);

    try {
      const monthParam = `${year}-${month}`;

      const res = await getFacultyCalendarView(orgId, monthParam);
      console.log("Faculty Attendance Data:", res);
      setData(res);

      // apply filters only after fetch
      setAppliedMonth(month);
      setAppliedYear(year);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEARCH ================= */

  const filteredUsers = useMemo(() => {
    if (!data) return [];

    return data.users.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [data, search]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  /* ================= EXCEL ================= */

  const exportToExcel = () => {
    if (!data) return;

    const sheetData: (string | number)[][] = [];
    const header = ["Name", "ID", "P/W", "%", ...data.days];

    sheetData.push(header);

    filteredUsers.forEach((user) => {
      const row: (string | number)[] = [
        user.name,
        user.userId,
        `${user.summary.present}/${user.summary.workingDays}`,
        user.summary.attendancePercentage,
      ];

      data.days.forEach((day) => {
        const status = user.attendance?.[day];
        row.push(status ? status[0] : "-");
      });

      sheetData.push(row);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Faculty Attendance");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(blob, `Faculty-Attendance-${appliedYear}-${appliedMonth}.xlsx`);
  };

  const fileUrlToDataUrl = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Unable to load image"));
      reader.readAsDataURL(blob);
    });
  };

  const exportToPdf = async () => {
    if (!data) return;

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    let logoDataUrl: string | null = null;
    try {
      logoDataUrl = await fileUrlToDataUrl(attenzyLogo);
    } catch {
      logoDataUrl = null;
    }

    const drawHeader = () => {
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 88, "F");

      if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", 24, 20, 50, 50);
      }

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Attenzy Faculty Attendance Report", logoDataUrl ? 84 : 24, 42);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        `Period: ${appliedMonthLabel ?? appliedMonth} ${appliedYear}`,
        logoDataUrl ? 84 : 24,
        60,
      );
      doc.text(
        `Generated: ${format(new Date(), "dd MMM yyyy, hh:mm a")}`,
        pageWidth - 24,
        60,
        {
          align: "right",
        },
      );

      doc.setTextColor(30, 41, 59);
    };

    const tableHeader = ["Name", "ID", "P/W", "%", ...data.days];
    const tableBody = filteredUsers.map((user) => [
      user.name,
      user.userId,
      `${user.summary.present}/${user.summary.workingDays}`,
      `${user.summary.attendancePercentage}%`,
      ...data.days.map((day) => user.attendance?.[day]?.[0] ?? "-"),
    ]);

    autoTable(doc, {
      head: [tableHeader],
      body: tableBody,
      startY: 102,
      margin: { left: 20, right: 20, bottom: 28, top: 20 },
      styles: {
        fontSize: 7,
        textColor: [15, 23, 42],
        cellPadding: 2,
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 120, halign: "left" },
        1: { cellWidth: 84, halign: "left" },
        2: { cellWidth: 42 },
        3: { cellWidth: 36 },
      },
      didDrawPage: () => {
        drawHeader();

        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(
          `Page ${doc.getCurrentPageInfo().pageNumber}`,
          pageWidth - 24,
          pageHeight - 12,
          {
            align: "right",
          },
        );
      },
    });

    doc.save(`Faculty-Attendance-${appliedYear}-${appliedMonth}.pdf`);
  };

  const appliedMonthLabel = monthOptions.find(
    (m) => m.value === appliedMonth,
  )?.label;

  return (
    <div className="w-full py-6 space-y-6">
      {/* FILTER CARD */}
      <div>
        <CardTitle className="text-2xl font-semibold mb-4">
          Monthly Faculty Attendance Record
        </CardTitle>

        <div className="flex flex-wrap gap-4 items-end">
          {/* Month */}
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Month" />
            </SelectTrigger>

            <SelectContent>
              {monthOptions.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year */}
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Year" />
            </SelectTrigger>

            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleRefresh}>
            {loading ? "Loading..." : "Generate"}
          </Button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 p-2">
              <CheckIcon className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Present</p>
              <p className="text-2xl font-semibold">
                {data.overallSummary.present}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 p-2">
              <XIcon className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Absent</p>
              <p className="text-2xl font-semibold">
                {data.overallSummary.absent}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 p-2">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Leave</p>
              <p className="text-2xl font-semibold">
                {data.overallSummary.leave}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 p-2">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Holiday</p>
              <p className="text-2xl font-semibold">
                {data.overallSummary.holiday}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE LEGEND */}
      {data && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm ">
            <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-medium">
              P — Present
            </span>

            <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-medium">
              A — Absent
            </span>

            <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 font-medium">
              L — Leave
            </span>

            <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
              H — Holiday
            </span>

            <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 font-medium">
              — No Data
            </span>

            <span className="text-blue-600 font-medium ml-2">
              (P/W — Present Days / Working Days)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search faculty..."
              className="w-full sm:w-60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download size={16} />
                  Download
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => void exportToPdf()}>
                  <FileText size={16} />
                  Download PDF
                </DropdownMenuItem>

                <DropdownMenuItem onSelect={exportToExcel}>
                  <FileSpreadsheet size={16} />
                  Download Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* TABLE CARD */}
      {data && (
        <>
          <AttendanceTable days={data.days} users={paginatedUsers} />
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
                  ),
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
        </>
      )}
    </div>
  );
}
