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
import { Separator } from "@/components/ui/separator";


import { Search, Save } from "lucide-react";
import { SidebarRight } from "@/components/sidebar-right";

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
    <div >

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Mark Attendance 
        </h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          Mark attendance manually for students / faculty / staff
        </div>
      </div>
      <br />

      <Separator />

      {/* Main Layout */}
      <div className="flex justify-between gap-5">

        {/* LEFT SIDE */}
        <Card className="flex-1 my-6 mx-4">
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

              <Button className="gap-2 bg-primary">
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
                                  ? "bg-primary text-white hover:bg-primary"
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
        {/* <Card>
          <CardContent className="space-y-4 p-4">

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
        </Card> */}

        <SidebarRight />
      </div>
    </div>
  );
};

export default ManualAttendancePage;
