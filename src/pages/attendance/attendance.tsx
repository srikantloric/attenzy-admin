import { useMemo, useState } from "react";
import type { AttendanceStatus } from "@/data/manualAttendance";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { Calendar } from "@/components/ui/calendar";

import { Search, Save, PlayCircle } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Mock Data (replace with API later)                                  */
/* ------------------------------------------------------------------ */

interface StudentAttendance {
  id: string;
  name: string;
  classId: string;
  status: AttendanceStatus;
}

const initialData: StudentAttendance[] = [
  { id: "NMNP20250126", name: "Kinjal Kumari", classId: "STD-1", status: "present" },
  { id: "NMNP20250131", name: "Rupa Murmu", classId: "STD-1", status: "absent" },
  { id: "NMNP20250127", name: "Jayaram Kumar", classId: "STD-1", status: "present" },
  { id: "NMNP20250125", name: "Sandeep Soren", classId: "STD-1", status: "present" }
];

const STATUS_OPTIONS: AttendanceStatus[] = [
  "present",
  "absent",
  "halfday",
  "leave",
  "sick"
];

/* ------------------------------------------------------------------ */

const ManualAttendancePage = () => {
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("STD-1");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [records, setRecords] = useState(initialData);

  const filteredRecords = useMemo(() => {
    return records.filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [records, search]);

  const updateStatus = (id: string, status: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status } : r
      )
    );
  };

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Mark Attendance Manually
        </h1>

        <Button variant="outline" className="gap-2">
          <PlayCircle className="h-4 w-4" />
          Help Video
        </Button>
      </div>

      <Separator />

      {/* Main Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">

        {/* LEFT SIDE */}
        <Card>
          <CardContent className="space-y-4 p-4">

            {/* Search + Save */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search student"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>

            {/* Attendance Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredRecords.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.id}</TableCell>

                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>

                    <TableCell>{student.classId}</TableCell>

                    <TableCell>
                      <div className="flex gap-1">
                        {STATUS_OPTIONS.map((status) => {
                          const active = student.status === status;
                          return (
                            <Button
                              key={status}
                              size="sm"
                              variant={active ? "default" : "outline"}
                              className={
                                active
                                  ? "bg-green-600 text-white hover:bg-green-600"
                                  : "px-2"
                              }
                              onClick={() =>
                                updateStatus(student.id, status)
                              }
                            >
                              {status.charAt(0).toUpperCase()}
                            </Button>
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

          </CardContent>
        </Card>

        {/* RIGHT SIDE */}
        <Card>
          <CardContent className="space-y-4 p-4">

            {/* Class Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select Class
              </label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STD-1">STD-1</SelectItem>
                  <SelectItem value="STD-2">STD-2</SelectItem>
                  <SelectItem value="STD-3">STD-3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select Date
              </label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </div>

            <Button className="w-full gap-2">
              Load Students
            </Button>

          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default ManualAttendancePage;
