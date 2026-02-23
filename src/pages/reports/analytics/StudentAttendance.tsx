import { useEffect, useMemo, useState } from "react"
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
} from "date-fns"

import useAuth from "@/hooks/useAuth"
import { getAttendanceByStudent } from "@/api/reports/studentAttendance"
import { getUsersByOrg } from "@/api/users"

import type { AttendanceItem } from "@/types/attendance"
import type { User } from "@/types/users"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"

export default function StudentAttendance() {
    const { user } = useAuth()
    const orgId = user?.orgId

    const [students, setStudents] = useState<User[]>([])
    const [selectedUserId, setSelectedUserId] = useState("")
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date()
        return format(now, "yyyy-MM")
    })

    const [attendance, setAttendance] = useState<AttendanceItem[]>([])
    const [loading, setLoading] = useState(false)

    /* ================= FETCH STUDENTS ================= */

    useEffect(() => {
        if (!orgId) return

        const fetchStudents = async () => {
            try {
                const users = await getUsersByOrg(orgId)
                const studentsOnly = users.filter(
                    (user: any) => user.userType === "STUDENT"
                )
                setStudents(studentsOnly)
            } catch (error) {
                console.error("Failed to fetch students", error)
            }
        }

        fetchStudents()
    }, [orgId])

    /* ================= MONTH OPTIONS ================= */

    const monthOptions = useMemo(() => {
        const options = []
        const now = new Date()

        const totalMonths = 12

        for (let i = 0; i < totalMonths; i++) {
            const date = new Date(
                now.getFullYear(),
                now.getMonth() - i,
                1
            )

            options.push({
                value: format(date, "yyyy-MM"),
                label: format(date, "MMMM yyyy"),
            })
        }

        return options
    }, [])

    /* ================= GENERATE ATTENDANCE ================= */

    const handleGenerate = async () => {
        if (!orgId || !selectedUserId) return

        try {
            setLoading(true)
            const data = await getAttendanceByStudent(
                orgId,
                selectedUserId
            )
            setAttendance(data)
        } catch (error) {
            console.error("Failed to fetch attendance", error)
        } finally {
            setLoading(false)
        }
    }

    /* ================= BUILD REGISTER ================= */

    const registerData = useMemo(() => {
        if (!selectedUserId || !selectedMonth) return []

        const monthStart = startOfMonth(
            new Date(selectedMonth + "-01")
        )
        const monthEnd = endOfMonth(monthStart)

        const allDays = eachDayOfInterval({
            start: monthStart,
            end: monthEnd,
        })

        const attendanceDates = new Set(
            attendance.map((a) => a.date)
        )

        return allDays.map((day) => {
            const formatted = format(day, "yyyy-MM-dd")
            const isSunday = day.getDay() === 0

            if (isSunday) return { date: formatted, status: "H" }
            if (attendanceDates.has(formatted))
                return { date: formatted, status: "P" }

            return { date: formatted, status: "-" }
        })
    }, [attendance, selectedUserId, selectedMonth])

    const selectedStudent = students.find(
        (s) => s.userId === selectedUserId
    )

    return (
        <div className="w-full max-w-6xl mx-auto px-3 py-4 sm:px-6 sm:py-6 space-y-6">

            {/* ================= FILTER CARD ================= */}

            <Card>
                <CardHeader>
                    <CardTitle>Student Attendance Register</CardTitle>
                </CardHeader>

                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">

                    {/* Student Select */}
                    <Combobox
                        items={students.map((s) => s.userId)}
                        value={selectedUserId}
                        onValueChange={(value) => {
                            if (!value) return
                            setSelectedUserId(value)
                        }}
                    >
                        <ComboboxInput
                            className="w-full"
                            placeholder="Search student..."
                        />
                        <ComboboxContent>
                            <ComboboxEmpty>No student found.</ComboboxEmpty>
                            <ComboboxList>
                                {(userId) => {
                                    const student = students.find(
                                        (s) => s.userId === userId
                                    )
                                    return (
                                        <ComboboxItem
                                            key={userId}
                                            value={userId}
                                        >
                                            {student?.name} ({userId})
                                        </ComboboxItem>
                                    )
                                }}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>

                    {/* Month-Year Dropdown */}
                    <Select
                        value={selectedMonth}
                        onValueChange={setSelectedMonth}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select month" />
                        </SelectTrigger>

                        <SelectContent>
                            {monthOptions.map((month) => (
                                <SelectItem
                                    key={month.value}
                                    value={month.value}
                                >
                                    {month.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Generate Button */}
                    <Button
                        className="w-full md:w-auto"
                        type="button"
                        onClick={handleGenerate}
                    >
                        {loading ? "Generating..." : "Generate"}
                    </Button>

                </CardContent>
            </Card>

            {/* ================= REGISTER TABLE ================= */}

            {selectedUserId && registerData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {selectedStudent?.name} ({selectedUserId}) —{" "}
                            {format(new Date(selectedMonth + "-01"), "MMMM yyyy")}
                        </CardTitle>
                    </CardHeader>

                    <CardContent>

                        {/* ================= DESKTOP VIEW ================= */}
                        <div className="hidden md:block overflow-hidden">
                            <div className="w-full overflow-x-auto border rounded-lg">
                                <Table className="min-w-max">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="sticky left-0 bg-background z-20 w-[200px] border-r">
                                                Student Name
                                            </TableHead>

                                            {registerData.map((day) => (
                                                <TableHead
                                                    key={day.date}
                                                    className="text-center w-10"
                                                >
                                                    {format(new Date(day.date), "dd")}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="sticky left-0 bg-background z-10 font-medium border-r w-[200px]">
                                                {selectedStudent?.name}
                                            </TableCell>

                                            {registerData.map((day) => (
                                                <TableCell
                                                    key={day.date}
                                                    className="text-center w-10"
                                                >
                                                    <span
                                                        className={`
                        inline-flex items-center justify-center 
                        h-7 w-7 rounded-md text-xs font-semibold
                        ${day.status === "P"
                                                                ? "bg-green-100 text-green-700"
                                                                : day.status === "H"
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : "bg-muted text-muted-foreground"
                                                            }
                      `}
                                                    >
                                                        {day.status}
                                                    </span>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* ================= MOBILE VIEW ================= */}
                        <div className="block md:hidden space-y-2">
                            {registerData.map((day) => (
                                <div
                                    key={day.date}
                                    className="flex justify-between items-center border rounded-md px-3 py-2"
                                >
                                    <span className="text-sm font-medium">
                                        {format(new Date(day.date), "dd MMM")}
                                    </span>

                                    <span
                                        className={`
                h-7 w-7 flex items-center justify-center rounded-md text-xs font-semibold
                ${day.status === "P"
                                                ? "bg-green-100 text-green-700"
                                                : day.status === "H"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-muted text-muted-foreground"
                                            }
              `}
                                    >
                                        {day.status}
                                    </span>
                                </div>
                            ))}
                        </div>

                    </CardContent>
                </Card>
            )}
        </div>
    )
}
