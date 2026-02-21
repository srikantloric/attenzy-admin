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
import { Input } from "@/components/ui/input"
import { CalendarIcon, Search } from "lucide-react"
import { format } from "date-fns"
import DataPagination from "@/components/Pagination"
import { useFilterPagination } from "@/hooks/useFilterPagination"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const IotAttendance: React.FC = () => {
    const { user } = useAuth()
    const orgId = user?.orgId

    const [attendance, setAttendance] = useState<AttendanceItem[]>([])
    const [loading, setLoading] = useState(false)

    const [selectedDate, setSelectedDate] = useState<Date>(new Date())

    const [search, setSearch] = useState("")
    const [filterStatus, setFilterStatus] =
        useState<"all" | "present" | "absent">("all")

    const [classFilter, setClassFilter] = useState("all")
    const [userTypeFilter, setUserTypeFilter] = useState("all")


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


    const availableClasses = useMemo(() => {
        const set = new Set(
            attendance.map((a) => a.userProfile.class)
        )
        return ["all", ...Array.from(set)]
    }, [attendance])

    const availableUserTypes = [
        "all",
        "STUDENT",
        "FACULTY",
        "STAFF",
    ]


    const filteredRecords = useMemo(() => {
        let data = attendance.filter(
            (a) => a.date === formattedDate
        )

        // Status filter
        if (filterStatus === "absent") {
            data = []
        }

        // Class filter
        if (classFilter !== "all") {
            data = data.filter(
                (a) => a.userProfile.class === classFilter
            )
        }

        // UserType filter
        if (userTypeFilter !== "all") {
            data = data.filter(
                (a) =>
                    a.userType?.toUpperCase() === userTypeFilter
            )
        }

        // Search filter
        if (search) {
            data = data.filter((a) =>
                a.userName
                    .toLowerCase()
                    .includes(search.toLowerCase())
            )
        }

        return data
    }, [
        attendance,
        formattedDate,
        filterStatus,
        classFilter,
        userTypeFilter,
        search,
    ])


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
        const set = new Set(
            filteredRecords.map((r) => r.userId)
        )
        return set.size
    }, [filteredRecords])


    return (
        <div className="space-y-6 p-6">
            <AppBreadcrumb />

            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">
                    Smart Attendance
                </h1>

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

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between gap-4 flex-wrap">

                {/* Status Buttons */}
                <div className="flex gap-2">
                    {(["all", "present", "absent"] as const).map(
                        (status) => (
                            <Button
                                key={status}
                                size="sm"
                                variant={
                                    filterStatus === status
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() =>
                                    setFilterStatus(status)
                                }
                            >
                                {status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                            </Button>
                        )
                    )}
                </div>

                <div className="flex gap-3 items-center">

                    {/* Class Select */}
                    <Select
                        value={classFilter}
                        onValueChange={setClassFilter}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Class" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableClasses.map((cls) => (
                                <SelectItem key={cls} value={cls}>
                                    {cls === "all"
                                        ? "All Classes"
                                        : cls}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* UserType Select */}
                    <Select
                        value={userTypeFilter}
                        onValueChange={setUserTypeFilter}
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="User Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableUserTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type === "all"
                                        ? "All Types"
                                        : type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="pl-8 w-64"
                            placeholder="Search student..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />
                    </div>

                </div>
            </div>



            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Attendance Logs
                    </CardTitle>
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

                                        <TableCell>
                                            {record.time}
                                        </TableCell>

                                        <TableCell>
                                            <Badge className="bg-green-100 text-green-700">
                                                Present
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
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

export default IotAttendance
