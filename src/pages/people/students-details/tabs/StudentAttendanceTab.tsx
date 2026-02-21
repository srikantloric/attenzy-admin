"use client"

import { useEffect, useState } from "react"

import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

type AttendanceItem = {
  date: string
  status: "PRESENT" | "ABSENT" | "LEAVE" | "HOLIDAY"
}



function generateMockAttendance(month: string) {
  const [year, monthIndex] = month.split("-").map(Number)
  const totalDays = new Date(year, monthIndex, 0).getDate()

  const results = []

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, monthIndex - 1, day)

    const isoDate = date.toISOString().split("T")[0]
    const weekday = date.getDay()

    // Weekend = Holiday
    if (weekday === 0 || weekday === 6) {
      results.push({
        date: isoDate,
        status: "HOLIDAY",
      })
      continue
    }

    // Random distribution
    const random = Math.random()

    let status: "PRESENT" | "ABSENT" | "LEAVE"

    if (random < 0.8) {
      status = "PRESENT"
    } else if (random < 0.9) {
      status = "ABSENT"
    } else {
      status = "LEAVE"
    }

    results.push({
      date: isoDate,
      status,
    })
  }

  return results
}

function StudentAttendanceTab() {



  const [attendance, setAttendance] = useState<AttendanceItem[]>([])
  const [loading, setLoading] = useState(false)

  /* ================= FETCH ================= */

  useEffect(() => {
    setLoading(true)
    const month = new Date().toISOString().slice(0, 7)

    const mock = generateMockAttendance(month)
    setAttendance(mock)
    setLoading(false)
  }, [])

  /* ================= CALENDAR EVENTS ================= */

  const events = attendance.map(item => ({
    title: item.status,
    date: item.date,
    backgroundColor: getStatusBg(item.status),
    borderColor: getStatusBg(item.status),
  }))

  return (
    <div className="p-3">
      <Tabs defaultValue="calendar">

        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        {/* ================= CALENDAR ================= */}
        <TabsContent value="calendar">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            height="auto"
          />
        </TabsContent>

        {/* ================= TABLE ================= */}
        <TabsContent value="table">
          <div className="rounded-md border mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {attendance.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                )}

                {attendance.map((item) => (
                  <TableRow key={item.date}>
                    <TableCell>
                      {format(new Date(item.date), "dd MMM yyyy")}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(item.status)}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}

export default StudentAttendanceTab

/* ================= STATUS HELPERS ================= */

function getStatusColor(status: string) {
  switch (status) {
    case "PRESENT":
      return "border-green-500 text-green-600"
    case "ABSENT":
      return "border-red-500 text-red-600"
    case "LEAVE":
      return "border-orange-500 text-orange-600"
    case "HOLIDAY":
      return "border-blue-500 text-blue-600"
    default:
      return ""
  }
}

function getStatusBg(status: string) {
  switch (status) {
    case "PRESENT":
      return "#16a34a"
    case "ABSENT":
      return "#dc2626"
    case "LEAVE":
      return "#f97316"
    case "HOLIDAY":
      return "#2563eb"
    default:
      return "#64748b"
  }
}