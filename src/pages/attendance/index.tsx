import { useMemo, useState } from "react";
import { attendanceData } from "@/data/manualAttendance";
import type {
  AttendanceRecord,
  AttendanceStatus
} from "@/data/manualAttendance";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { Search, Save } from "lucide-react";

const ManualAttendancePage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [records, setRecords] =
    useState<AttendanceRecord[]>(attendanceData);

  const filteredRecords = useMemo(() => {
    return records.filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [records, search]);

  const updateStatus = (
    id: number,
    status: AttendanceStatus
  ) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status } : r
      )
    );
  };

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Manual Attendance
        </h1>

        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Save Attendance
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Today</Badge>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="w-64 pl-8"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Role
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Students</DropdownMenuItem>
              <DropdownMenuItem>Faculty</DropdownMenuItem>
              <DropdownMenuItem>Staff</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Separator />

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Class / Section</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  Last Seen
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.id}</TableCell>

                  <TableCell className="font-medium">
                    {record.name}
                  </TableCell>

                  <TableCell className="capitalize">
                    {record.role}
                  </TableCell>

                  <TableCell>
                    {record.classSection ?? "—"}
                  </TableCell>

                  {/* Status Toggle */}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className={
                          record.status === "present"
                            ? "bg-green-600 text-white hover:bg-green-600"
                            : "border"
                        }
                        variant={
                          record.status === "present"
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          updateStatus(record.id, "present")
                        }
                      >
                        Present
                      </Button>

                      <Button
                        size="sm"
                        className={
                          record.status === "absent"
                            ? "bg-red-600 text-white hover:bg-red-600"
                            : "border"
                        }
                        variant={
                          record.status === "absent"
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          updateStatus(record.id, "absent")
                        }
                      >
                        Absent
                      </Button>
                    </div>
                  </TableCell>

                  <TableCell className="text-right text-muted-foreground">
                    {record.lastSeen ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <p className="text-sm text-muted-foreground">
        Attendance is auto-saved locally. Click “Save Attendance”
        to submit.
      </p>

    </div>
  );
};

export default ManualAttendancePage;
