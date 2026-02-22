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
import useAuth from "@/hooks/useAuth"
import axiosServices from "@/utils/axios"
import { useParams } from "react-router-dom"

type AttendanceStatus = "PRESENT" | "ABSENT" | "LEAVE" | "HOLIDAY"

type ApiResponse = {
  month: string
  days: string[]
  users: {
    userId: string
    name: string
    attendance: Record<string, AttendanceStatus>
    summary: {
      present: number
      absent: number
      leave: number
      holiday: number
      attendancePercentage: number
    }
  }[]
}

function StudentAttendanceTab() {

  const { user } = useAuth()
  const orgId = user?.orgId

  const {id} = useParams()

 

  const [attendance, setAttendance] = useState<{ date: string; status: AttendanceStatus }[]>([])
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [loading, setLoading] = useState(false)

  /* ================= FETCH ================= */

  const fetchAttendance = async (selectedMonth: string) => {
    if (!orgId || !id) return

    try {
      setLoading(true)

      const res = await axiosServices.get<ApiResponse>(
        `/orgs/${orgId}/calendar-view`,
        {
          params: {
            month: selectedMonth,
            userId:id
          }
        }
      )

      const data = res.data

      if (!data.users?.length) {
        setAttendance([])
        return
      }

      const userAttendance = data.users[0].attendance
      const year = Number(selectedMonth.split("-")[0])
      const monthIndex = Number(selectedMonth.split("-")[1])
      const daysInMonth = new Date(year, monthIndex, 0).getDate()

      const formatted: any[] = []

      for (let i = 1; i <= daysInMonth; i++) {
        const day = String(i).padStart(2, "0")
        const dateObj = new Date(year, monthIndex - 1, i)

        formatted.push({
          date: dateObj.toISOString().split("T")[0],
          status: userAttendance[day] || "HOLIDAY"
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

  const events = attendance.map(item => ({
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

          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            height="auto"
            datesSet={(arg) => {
              const newMonth = arg.startStr.slice(0, 7)
              if (newMonth !== month) {
                setMonth(newMonth)
              }
            }}
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