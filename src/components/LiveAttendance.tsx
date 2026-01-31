import { Badge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export default function LiveAttendance() {
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
                        <TableRow>
                            <TableCell>09:02</TableCell>
                            <TableCell>Rahul S</TableCell>
                            <TableCell>Student</TableCell>
                            <TableCell>
                                <Badge  >Present</Badge>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>09:07</TableCell>
                            <TableCell>Dr. Meena</TableCell>
                            <TableCell>Faculty</TableCell>
                            <TableCell>
                                <Badge  >Late</Badge>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
