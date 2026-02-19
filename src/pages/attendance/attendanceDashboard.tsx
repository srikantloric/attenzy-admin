import { useEffect, useMemo, useState } from "react"
import useAuth from "@/hooks/useAuth"
import { getAttendanceByOrg } from "@/api/attendance"
import type { AttendanceItem } from "@/types/attendance"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AppBreadcrumb } from "@/components/AppBreadCrumb"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import DataPagination from "@/components/Pagination"
import { useFilterPagination } from "@/hooks/useFilterPagination"

const SmartAttendanceDashboard: React.FC = () => {
    const { user } = useAuth()
    const orgId = user?.orgId

    const [attendance, setAttendance] = useState<AttendanceItem[]>([])
    const [loading, setLoading] = useState(false)

    const [selectedDate, setSelectedDate] = useState<Date>(new Date())


    useEffect(() => {
        if (!orgId) return

        setLoading(true)

        getAttendanceByOrg(orgId)
            .then(setAttendance)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [orgId])



    const formattedDate = useMemo(() => {
        return format(selectedDate, "yyyy-MM-dd")
    }, [selectedDate])

    const filteredRecords = useMemo(() => {
        return attendance.filter((a) => a.date === formattedDate)
    }, [attendance, formattedDate])

    const {
        currentPage,
        setCurrentPage,
        rowsPerPage,
        setRowsPerPage,
        filteredData,
        paginatedData,
    } = useFilterPagination<AttendanceItem>({
        data: filteredRecords,
        searchKey: "userName",
        getIsActive: () => true, 
    })


    const totalPunches = filteredRecords.length

    const uniqueStudents = useMemo(() => {
        const set = new Set(filteredRecords.map((r) => r.userId))
        return set.size
    }, [filteredRecords])

    const deviceStats = useMemo(() => {
        const map: Record<string, number> = {}
        filteredRecords.forEach((r) => {
            map[r.deviceName] = (map[r.deviceName] || 0) + 1
        })
        return map
    }, [filteredRecords])


    return (
        <div className="space-y-6 p-6">
            <AppBreadcrumb />

            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">
                    Smart Attendance
                </h1>

                {/* Date Picker */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            {format(selectedDate, "PPP")}
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) =>
                                date && setSelectedDate(date)
                            }
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <Separator />

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">
                            Total Punches
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-bold">
                        {totalPunches}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">
                            Unique Students
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-bold">
                        {uniqueStudents}
                    </CardContent>
                </Card>

                {Object.entries(deviceStats).map(([device, count]) => (
                    <Card key={device}>
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">
                                {device}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-3xl font-bold">
                            {count}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Attendance Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Logs</CardTitle>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Device</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        Loading attendance...
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading &&
                                paginatedData.map((record) => (
                                    <TableRow key={record.timestamp}>
                                        <TableCell className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>
                                                    {record.userName
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">
                                                    {record.userName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {record.userId}
                                                </p>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            {record.userProfile.class} -{" "}
                                            {record.userProfile.section}
                                        </TableCell>

                                        <TableCell>
                                            {record.deviceName}
                                        </TableCell>

                                        <TableCell>{record.time}</TableCell>

                                        <TableCell>
                                            <Badge className="bg-green-100 text-green-700">
                                                Present
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}

                            {!loading && filteredRecords.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No attendance records for selected date.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>

                <Separator />

                <DataPagination
                    totalItems={filteredData.length}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                />

            </Card>
        </div>
    )
}

export default SmartAttendanceDashboard
