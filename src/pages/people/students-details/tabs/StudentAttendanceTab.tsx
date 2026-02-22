"use client"

import { useEffect, useRef, useState } from "react"
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
import useAuth from "@/hooks/useAuth"
import axiosServices from "@/utils/axios"
import { useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { AttendanceStatus, CalanderApiResponse } from "@/types/attendance"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AttendanceDonut } from "@/components/attendance/AttendanceDonut"
import { AttendanceTrendChart } from "@/components/attendance/AttendanceTrendChart"



function StudentAttendanceTab() {

  const { user } = useAuth()
  const orgId = user?.orgId
  const { id } = useParams()
  const [attendance, setAttendance] = useState<
    { date: string; status: AttendanceStatus | null }[]
  >([])
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [loading, setLoading] = useState(false)
  const calendarRef = useRef<any>(null)
  const [summary, setSummary] = useState<{
    present: number
    absent: number
    leave: number
    holiday: number
    attendancePercentage: number
  } | null>(null)

  /* ================= FETCH ================= */

  const fetchAttendance = async (selectedMonth: string) => {
    if (!orgId || !id) return

    try {
      setLoading(true)

      const res = await axiosServices.get<CalanderApiResponse>(
        `/orgs/${orgId}/calendar-view`,
        {
          params: {
            month: selectedMonth,
            userId: id
          }
        }
      )

      const data = res.data

      if (!data.users?.length) {
        setAttendance([])
        return
      }
      const userData = data.users[0]
      setSummary(userData.summary)
      const userAttendance = userData.attendance
      const year = Number(selectedMonth.split("-")[0])
      const monthIndex = Number(selectedMonth.split("-")[1])
      const daysInMonth = new Date(year, monthIndex, 0).getDate()

      const formatted: { date: string; status: AttendanceStatus | null }[] = []

      for (let i = 1; i <= daysInMonth; i++) {
        const day = String(i).padStart(2, "0")
        const dateObj = new Date(year, monthIndex - 1, i)

        formatted.push({
          date: format(dateObj, "yyyy-MM-dd"),
          status: userAttendance[day] || null,
        })
      }

      setAttendance(formatted)

    } catch (error) {
      console.error("Failed to fetch attendance", error)
      setAttendance([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance(month)
  }, [month, orgId, id])

  /* ================= CALENDAR EVENTS ================= */
  const events = attendance
    .filter((item): item is { date: string; status: AttendanceStatus } => !!item.status)
    .map(item => ({
      title: item.status,
      date: item.date,
      backgroundColor: getStatusBg(item.status),
      borderColor: getStatusBg(item.status),
    }))

  return (
    <div className="p-3 space-y-4">

      <Tabs defaultValue="calendar">

        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        {/* ================= CALENDAR ================= */}
        <TabsContent value="calendar">
          <div className="grid gap-4 lg:grid-cols-4">

            {/* LEFT → CALENDAR */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">
                  {format(new Date(month + "-01"), "MMMM yyyy")}
                </p>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => calendarRef.current?.getApi().prev()}>
                    <ChevronLeft />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => calendarRef.current?.getApi().today()}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => calendarRef.current?.getApi().next()}>
                    <ChevronRight />
                  </Button>
                </div>
              </div>

              <div>
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  events={events}
                  height="auto"
                  headerToolbar={false}
                  dayMaxEventRows={2}
                  datesSet={(arg) => {
                    const newMonth = arg.startStr.slice(0, 7)
                    if (newMonth !== month) setMonth(newMonth)
                  }}
                />
              </div>
              <br />
              <AttendanceTrendChart />
            </div>

            {/* RIGHT → SUMMARY CARD */}
            <div className="space-y-4 mt-11">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Attendance Summary</CardTitle>
                </CardHeader>

                <CardContent className="space-y-5">

                  {/* 🔵 Circular Progress */}

                  <AttendanceDonut percentage={summary?.attendancePercentage ?? 0} />


                  {/* 📊 Counts */}
                  <div className="space-y-2 text-sm">
                    <SummaryRow label="Present" value={summary?.present} color="text-green-600" />
                    <SummaryRow label="Absent" value={summary?.absent} color="text-red-600" />
                    <SummaryRow label="Leave" value={summary?.leave} color="text-orange-600" />
                    <SummaryRow label="Holiday" value={summary?.holiday} color="text-blue-600" />
                  </div>
                  {/* 🎯 75% Calculator */}
                  <RequiredAttendance75 summary={summary} />

                </CardContent>
              </Card>
            </div>

          </div>
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
                      {item.status ? (
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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

function getStatusColor(status: AttendanceStatus) {
  switch (status) {
    case "PRESENT":
      return "border-green-500 text-green-600"
    case "ABSENT":
      return "border-red-500 text-red-600"
    case "LEAVE":
      return "border-orange-500 text-orange-600"
    case "HOLIDAY":
      return "border-blue-500 text-blue-600"
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
      return ""
  }
}

function SummaryRow({
  label,
  value,
  color,
}: {
  label: string
  value?: number
  color: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${color}`}>{value ?? 0}</span>
    </div>
  )
}


function RequiredAttendance75({
  summary,
}: {
  summary: {
    present: number
    absent: number
    leave: number
    holiday: number
    attendancePercentage: number
  } | null
}) {
  if (!summary) return null

  const workingDays = summary.present + summary.absent + summary.leave
  const targetPresent = Math.ceil(0.75 * workingDays)
  const required = Math.max(targetPresent - summary.present, 0)

  const alreadySafe = summary.attendancePercentage >= 75

  return (
    <div className="pt-2 border-t text-sm">
      <p className="text-muted-foreground text-xs mb-1">
        Required for 75%
      </p>

      {alreadySafe ? (
        <p className="text-green-600 font-medium">You are above 75%</p>
      ) : (
        <p className="font-medium">
          Attend <span className="text-primary">{required}</span> more classes
        </p>
      )}
    </div>
  )
}