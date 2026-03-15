import { useEffect, useState } from "react"
import { format } from "date-fns"

import useAuth from "@/hooks/useAuth"

import { listGrades } from "@/api/academics"
import { getAttendanceByOrg } from "@/api/attendance"

import type { AcademicItem } from "@/types/academics"

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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"

import DataPagination from "@/components/Pagination"
import { useFilterPagination } from "@/hooks/useFilterPagination"
import { Separator } from "@/components/ui/separator"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function DailyAttendance() {

    const { user } = useAuth()
    const orgId = user?.orgId

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

    const [grades, setGrades] = useState<AcademicItem[]>([])
    const [selectedClass, setSelectedClass] = useState("")
    const [selectedSection, setSelectedSection] = useState("")

    const [attendanceData, setAttendanceData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [noData, setNoData] = useState(false)
    const [search, setSearch] = useState("")


    /* ================= FETCH CLASSES ================= */

    useEffect(() => {

        if (!orgId) return

        const fetchGrades = async () => {

            try {

                const data = await listGrades(orgId)
                setGrades(data)

            } catch (error) {

                console.error("Failed to fetch grades", error)

            }

        }

        fetchGrades()

    }, [orgId])


    /* ================= GENERATE ATTENDANCE ================= */

    const handleGenerate = async () => {

        if (!orgId || !selectedClass || !selectedDate) {
            alert("Please select date and class")
            return
        }

        try {

            setLoading(true)
            setNoData(false)

            const data = await getAttendanceByOrg(orgId)

            const formattedDate = format(selectedDate, "yyyy-MM-dd")

            const filtered = data.filter((item: any) => {

                return (
                    item.date === formattedDate &&
                    item.userProfile?.class === selectedClass &&
                    (selectedSection === "" ||
                        item.userProfile?.section === selectedSection)
                )

            })

            if (filtered.length === 0) {
                setNoData(true)
            }

            const result = filtered.map((item: any) => ({
                userId: item.userId,
                name: item.userName,
                class: item.userProfile?.class,
                section: item.userProfile?.section,
                rollNumber: item.userProfile?.rollNumber,
                firstScan: item.time,
                status: "PRESENT",
            }))

            setAttendanceData(result)

        } catch (error) {

            console.error("Attendance fetch error:", error)

        } finally {

            setLoading(false)

        }

    }


    /* ================= SUMMARY ================= */

    const total = attendanceData.length

    const present = attendanceData.filter(
        (a) => a.status === "PRESENT"
    ).length

    const filteredRecords = attendanceData.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    )

    const {
        currentPage,
        setCurrentPage,
        rowsPerPage,
        setRowsPerPage,
        filteredData,
        paginatedData,
    } = useFilterPagination({
        data: filteredRecords,
        searchKey: "name",
        getIsActive: () => true,
    })

    return (

        <div className="py-6 space-y-6">

            {/* ================= FILTER CARD ================= */}

            <Card>

                <CardHeader>
                    <CardTitle>Daily Attendance</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-wrap gap-4 items-end">


                    {/* DATE PICKER */}

                    <Popover>

                        <PopoverTrigger asChild>

                            <Button
                                variant="outline"
                                className="w-[180px] justify-start text-left font-normal"
                            >

                                <CalendarIcon className="mr-2 h-4 w-4" />

                                {selectedDate
                                    ? format(selectedDate, "PPP")
                                    : "Select Date"}

                            </Button>

                        </PopoverTrigger>

                        <PopoverContent className="w-auto p-0">

                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                initialFocus
                            />

                        </PopoverContent>

                    </Popover>


                    {/* CLASS SELECT */}

                    <Select
                        value={selectedClass}
                        onValueChange={(val) => setSelectedClass(val)}
                    >

                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select Class" />
                        </SelectTrigger>

                        <SelectContent>

                            {grades.map((grade) => (
                                <SelectItem
                                    key={grade.gradeId}
                                    value={grade.name}
                                >
                                    {grade.name}
                                </SelectItem>
                            ))}

                        </SelectContent>

                    </Select>


                    {/* SECTION SELECT */}

                    <Select
                        value={selectedSection}
                        onValueChange={(val) => setSelectedSection(val)}
                    >

                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select Section" />
                        </SelectTrigger>

                        <SelectContent>

                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>

                        </SelectContent>

                    </Select>


                    {/* GENERATE BUTTON */}

                    <Button
                        type="button"
                        onClick={handleGenerate}
                        className="w-[140px]"
                    >

                        {loading ? "Loading..." : "Generate"}

                    </Button>


                </CardContent>

            </Card>


            {/* ================= NO DATA MESSAGE ================= */}

            {noData && (

                <p className="text-red-500">
                    No data available for this date
                </p>

            )}


            {/* ================= SUMMARY ================= */}

            {attendanceData.length > 0 && (

                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">

                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">
                                Total Students Present
                            </p>
                            <p className="text-xl font-bold">{total}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">
                                Present
                            </p>
                            <p className="text-xl font-bold text-green-600">
                                {present}
                            </p>
                        </CardContent>
                    </Card>

                </div>

            )}


            {/* ================= TABLE ================= */}

            {attendanceData.length > 0 && (

                <Card>

                    <CardHeader className="flex flex-row items-center justify-between">

                        <CardTitle>Attendance Details</CardTitle>

                        <div className="relative">

                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />

                            <Input
                                className="pl-8 w-64"
                                placeholder="Search student..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                        </div>

                    </CardHeader>

                    <CardContent className="overflow-x-auto">

                        <Table>

                            <TableHeader>

                                <TableRow>

                                    <TableHead>Name</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Roll No</TableHead>
                                    <TableHead>First Scan</TableHead>
                                    <TableHead>Status</TableHead>

                                </TableRow>

                            </TableHeader>


                            <TableBody>

                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">
                                            Loading attendance...
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading && paginatedData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                                            No data is available for this date
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading &&
                                    paginatedData.length > 0 &&
                                    paginatedData.map((item: any) => (

                                        <TableRow key={`${item.userId}-${item.time}`}>

                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.class}</TableCell>
                                            <TableCell>{item.section}</TableCell>
                                            <TableCell>{item.rollNumber}</TableCell>
                                            <TableCell>{item.firstScan}</TableCell>

                                            <TableCell>
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                                    {item.status}
                                                </span>
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

            )}

        </div>

    )

}
