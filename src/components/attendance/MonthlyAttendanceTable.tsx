
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type AttendanceStatus = "PRESENT" | "ABSENT" | "LEAVE" | "HOLIDAY"

interface User {
  userId: string
  name: string
  attendance: Record<string, AttendanceStatus>
  summary: {
    present: number
    absent: number
    leave: number
    holiday: number
    workingDays: number
    attendancePercentage: number
  }
}

interface Props {
  month: string
  days: string[]
  users: User[]
}

function DayChip({ status }: { status?: AttendanceStatus }) {
  if (!status)
    return <span className="text-muted-foreground text-xs">-</span>

  const styles: Record<AttendanceStatus, string> = {
    PRESENT: "bg-green-100 text-green-700",
    ABSENT: "bg-red-100 text-red-700",
    LEAVE: "bg-yellow-100 text-yellow-700",
    HOLIDAY: "bg-blue-100 text-blue-700",
  }

  return (
    <span
      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${styles[status]}`}
    >
      {status[0]}
    </span>
  )
}

export function MonthlyAttendanceTable({  days, users }: Props) {
  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        <Badge className="bg-green-100 text-green-700">P – Present</Badge>
        <Badge className="bg-red-100 text-red-700">A – Absent</Badge>
        <Badge className="bg-yellow-100 text-yellow-700">L – Leave</Badge>
        <Badge className="bg-blue-100 text-blue-700">H – Holiday</Badge>
        <Badge variant="secondary">– No Data</Badge>
        <Badge className="ml-2 bg-blue-50 text-blue-700">
          P/W – Present / Working
        </Badge>
      </div>

      {/* Scrollable Table */}
      <div className="border rounded-lg">
        <ScrollArea className="w-full">
          <div className="min-w-[900px]">
            <Table>
              {/* Header */}
              <TableHeader className="bg-primary text-primary-foreground sticky top-0 z-20">
                <TableRow>
                  <TableHead className="sticky left-0 z-30 bg-primary min-w-[220px]">
                    Profile
                  </TableHead>

                  <TableHead className="text-center">P/W</TableHead>
                  <TableHead className="text-center">A</TableHead>
                  <TableHead className="text-center">L</TableHead>

                  {days.map((day) => (
                    <TableHead key={day} className="text-center">
                      {day}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              {/* Body */}
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.userId}>
                    {/* Profile column (sticky) */}
                    <TableCell className="sticky left-0 bg-background z-10 min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8" />
                        <div className="leading-tight">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {user.userId}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* P/W */}
                    <TableCell className="text-center">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold">
                        {user.summary.present}/{user.summary.workingDays}
                      </span>
                    </TableCell>

                    {/* Absent */}
                    <TableCell className="text-center">
                      {user.summary.absent}
                    </TableCell>

                    {/* Leave */}
                    <TableCell className="text-center">
                      {user.summary.leave}
                    </TableCell>

                    {/* Days */}
                    {days.map((day) => (
                      <TableCell key={day} className="text-center">
                        <DayChip status={user.attendance?.[day]} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Horizontal scrollbar */}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  )
}