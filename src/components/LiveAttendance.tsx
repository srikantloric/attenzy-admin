import { CheckCircle2 } from "lucide-react"

import type { AttendanceItem } from "@/types/attendance"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"

type LiveAttendanceProps = {
    records: AttendanceItem[]
    loading?: boolean
}

export default function LiveAttendance({ records, loading = false }: LiveAttendanceProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Live Attendance</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                                    Loading live attendance...
                                </TableCell>
                            </TableRow>
                        ) : records.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                                    No attendance scans available yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            records.map((record) => (
                                <TableRow key={`${record.userId}-${record.timestamp}`}>
                                    <TableCell>
                                        {new Date(record.timestamp).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </TableCell>
                                    <TableCell>{record.userName}</TableCell>
                                    <TableCell>
                                        {record.userType.charAt(0) + record.userType.slice(1).toLowerCase()}
                                    </TableCell>
                                    <TableCell>
                                        <CheckCircle2 className="text-primary" />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
