import { useEffect, useState } from "react"
import { format } from "date-fns"

import useAuth from "@/hooks/useAuth"

import { listGrades } from "@/api/academics"
import { getClassAttendance } from "@/api/reports/studentAttendance"

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


export default function DailyAttendance() {

    const { user } = useAuth()
    const orgId = user?.orgId


    const [selectedDate, setSelectedDate] = useState(
        format(new Date(), "yyyy-MM-dd")
    )

    const [grades, setGrades] = useState<AcademicItem[]>([])
    const [selectedClass, setSelectedClass] = useState("")

    const [attendanceData, setAttendanceData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)


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

        if (!orgId || !selectedClass) {
            alert("Please select class")
            return
        }

        try {

            setLoading(true)


            const formattedDate = format(
                new Date(selectedDate),
                "yyyyMMdd"
            )



            const res = await getClassAttendance(
                orgId,
                selectedClass,
                formattedDate
            )


            const scans = res.items || []



            /* GROUP MULTIPLE SCANS BY STUDENT */

            const studentMap: any = {}

            scans.forEach((item: any) => {

                if (!studentMap[item.userId]) {

                    studentMap[item.userId] = {
                        userId: item.userId,
                        name: item.userName,
                        class: item.userProfile?.class,
                        section: item.userProfile?.section,
                        rollNumber: item.userProfile?.rollNumber,
                        firstScan: item.time,
                        status: "PRESENT",
                    }

                } else {

                    if (item.time < studentMap[item.userId].firstScan) {
                        studentMap[item.userId].firstScan = item.time
                    }

                }

            })



            setAttendanceData(Object.values(studentMap))

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



    return (

        <div className="max-w-7xl mx-auto p-6 space-y-6">



            {/* ================= FILTER CARD ================= */}

            <Card>

                <CardHeader>
                    <CardTitle>Daily Attendance</CardTitle>
                </CardHeader>

                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    {/* DATE */}

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border rounded-md px-3 py-2"
                    />



                    {/* CLASS SELECT */}

                    <Select
                        value={selectedClass}
                        onValueChange={(val) => setSelectedClass(val)}
                    >

                        <SelectTrigger>
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



                    {/* GENERATE */}

                    <Button
                        type="button"
                        onClick={handleGenerate}
                    >

                        {loading ? "Loading..." : "Generate"}

                    </Button>



                </CardContent>

            </Card>



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

                    <CardHeader>
                        <CardTitle>Attendance Details</CardTitle>
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

                                {attendanceData.map((item: any) => (

                                    <TableRow key={item.userId}>

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

                </Card>

            )}

        </div>

    )

}