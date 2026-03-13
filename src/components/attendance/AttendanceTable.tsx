import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type {
  AttendanceUser,
  AttendanceStatus
} from "@/types/reports/attendance"

interface Props {
  days: string[]
  users: AttendanceUser[]
}


function getBadge(status?: AttendanceStatus) {
  let display = "-"

  if (status === "PRESENT") display = "P"
  if (status === "ABSENT") display = "A"
  if (status === "LEAVE") display = "L"
  if (status === "HOLIDAY") display = "H"

  return (
    <span
      className={`inline-flex items-center justify-center 
      h-6 w-6 rounded-md text-xs font-semibold
      ${display === "P"
          ? "bg-green-100 text-green-700"
          : display === "A"
            ? "bg-red-100 text-red-700"
            : display === "L"
              ? "bg-yellow-100 text-yellow-700"
              : display === "H"
                ? "bg-blue-100 text-blue-700"
                : "bg-muted text-muted-foreground"
        }`}
    >
      {display}
    </span>
  )
}

/* ================= TABLE ================= */

export function AttendanceTable({ days, users }: Props) {
  return (
    <div className=" overflow-x-auto rounded-lg border">

      <Table className=" text-xs sm:text-sm">

        {/* HEADER */}
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 z-30 bg-background border-r whitespace-nowrap">
              Name
            </TableHead>

            <TableHead className="text-center">P/W</TableHead>
            <TableHead className="text-center">%</TableHead>

            {days.map((day) => (
              <TableHead
                key={day}
                className="text-center"
              >
                {day}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        {/* BODY */}
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.userId}>

              {/* Sticky Name Column */}
              <TableCell className="flex gap-2 items-center sticky left-0 z-20 bg-background border-r font-medium min-w-[180px] whitespace-nowrap">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                  >
                  </AvatarImage>

                  <AvatarFallback>
                    {user.name?.[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col items-start">
                  <p className="font-bold">
                    {user.name.toUpperCase()}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {user.userId}
                  </span>
                </div>
              </TableCell>

              {/* P/W */}
              <TableCell className="text-center font-semibold">
                {user.summary.present}/
                {user.summary.workingDays}
              </TableCell>

              {/* % */}
              <TableCell className="text-center font-semibold">
                {user.summary.attendancePercentage}%
              </TableCell>

              {/* Daily Cells */}
              {days.map((day) => (
                <TableCell key={day} className="text-center">
                  {getBadge(user.attendance?.[day])}
                </TableCell>
              ))}

            </TableRow>
          ))}
        </TableBody>

      </Table>

    </div>
  )
}