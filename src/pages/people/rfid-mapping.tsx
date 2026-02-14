import { useEffect, useMemo, useState } from "react";
import { AssignRFIDSidebar } from "@/components/rfid/AssignRFIDSidebar";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, Plus } from "lucide-react";

import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";

import type { User, UserType } from "@/types/users";
import { getUsersByOrg } from "@/api/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFilterPagination } from "@/hooks/useFilterPagination";
import DataPagination from "@/components/Pagination";

const RFIDMappingPage: React.FC = () => {
    const { user } = useAuth();
    const orgId = user?.orgId;

    const [users, setUsers] = useState<User[]>([]);
    const [activeTab, setActiveTab] =
        useState<UserType>("STUDENT");
    const [assignOpen, setAssignOpen] = useState(false);


    useEffect(() => {
        if (!orgId) return;

        const fetchUsers = async () => {
            try {
                const data = await getUsersByOrg(orgId);
                setUsers(data);
            } catch {
                toast.error("Failed to load users");
            }
        };

        fetchUsers();
    }, [orgId]);

    const tabFilteredUsers = useMemo(() => {
        return users.filter(
            (u) => u.userType === activeTab
        );
    }, [users, activeTab]);

    const {
        search,
        setSearch,
        currentPage,
        setCurrentPage,
        rowsPerPage,
        setRowsPerPage,
        filteredData,
        paginatedData,
    } = useFilterPagination<User>({
        data: tabFilteredUsers,
        searchKey: "name",
        getIsActive: (u) => u.isActive !== false,
    });

    if (!orgId) return null;

    const totalByType = (type: UserType) =>
        users.filter((u) => u.userType === type).length;


    const stats = useMemo(() => {
        return users.reduce(
            (acc, user) => {
                acc.totalUsers++;

                if (user.userType === "STUDENT")
                    acc.totalStudents++;

                if (user.userType === "FACULTY")
                    acc.totalFaculty++;

                if (user.userType === "STAFF")
                    acc.totalStaff++;

                return acc;
            },
            {
                totalUsers: 0,
                totalStudents: 0,
                totalFaculty: 0,
                totalStaff: 0,
            }
        );
    }, [users]);


    return (
        <>
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold">
                        User RFID Mapping
                    </h1>

                    <Button
                        className="gap-2 bg-primary"
                        onClick={() => setAssignOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Assign RFID
                    </Button>
                </div>

                {/* Meta */}
                <div className="text-sm text-muted-foreground">

                    Students:{" "}
                    <span className="text-primary font-medium">
                        {stats.totalStudents}
                    </span>

                    <span className="ml-4">
                        Faculty:{" "}
                        <span className="text-primary font-medium">
                            {stats.totalFaculty}
                        </span>
                    </span>

                    <span className="ml-4">
                        Staff:{" "}
                        <span className="text-primary font-medium">
                            {stats.totalStaff}
                        </span>
                    </span>
                </div>

                <Separator />

                {/* Tabs */}
                <div className="flex gap-2">
                    {(["STUDENT", "FACULTY", "STAFF"] as UserType[]).map(
                        (type) => (
                            <Button
                                key={type}
                                size="sm"
                                variant={
                                    activeTab === type
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() => setActiveTab(type)}
                            >
                                {type}
                                <Badge
                                    variant="secondary"
                                    className="ml-2"
                                >
                                    {totalByType(type)}
                                </Badge>
                            </Button>
                        )
                    )}
                </div>

                {/* Search */}
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-8"
                        placeholder="Search by name or ID..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />
                </div>

                {/* Table */}
                <Card>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>

                                    <TableHead>Name</TableHead>
                                    <TableHead>Phone</TableHead>

                                    {/* Dynamic Column */}
                                    {activeTab === "STUDENT" && (
                                        <>
                                            <TableHead>Class</TableHead>
                                            <TableHead>Section</TableHead>
                                            <TableHead>Roll No</TableHead>
                                        </>
                                    )}

                                    {activeTab === "FACULTY" && (
                                        <>
                                            <TableHead>Department</TableHead>
                                            <TableHead>Subjects</TableHead>
                                        </>
                                    )}

                                    {activeTab === "STAFF" && (
                                        <>
                                            <TableHead>Department</TableHead>
                                            <TableHead>Designation</TableHead>
                                        </>
                                    )}

                                    <TableHead>RFID</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {paginatedData.map((user) => (
                                    <TableRow key={user.userId}>

                                        <TableCell className="flex gap-2 items-center">
                                            <Avatar>
                                                <AvatarImage
                                                    src="https://github.com/shadcn.png"
                                                    alt="@shadcn"
                                                >
                                                </AvatarImage>
                                                <AvatarFallback>CN</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <p className="font-bold">
                                                    {user.name.toUpperCase()}
                                                </p>
                                                <p className="text-foreground text-xs font-normal">
                                                    {user.userId}
                                                </p>
                                            </div>

                                        </TableCell>

                                        <TableCell>{user.phone}</TableCell>

                                        {/* Student */}
                                        {user.userType === "STUDENT" && (
                                            <>
                                                <TableCell>
                                                    {user.profile.class}
                                                </TableCell>
                                                <TableCell>
                                                    {user.profile.section}
                                                </TableCell>
                                                <TableCell>
                                                    {user.profile.rollNumber}
                                                </TableCell>
                                            </>
                                        )}

                                        {/* Faculty */}
                                        {user.userType === "FACULTY" && (
                                            <>
                                                <TableCell>
                                                    {user.profile.department}
                                                </TableCell>
                                                <TableCell>
                                                    {user.profile.subjects}
                                                </TableCell>
                                            </>
                                        )}

                                        {/* Staff */}
                                        {user.userType === "STAFF" && (
                                            <>
                                                <TableCell>
                                                    {user.profile.department}
                                                </TableCell>
                                                <TableCell>
                                                    {user.profile.designation}
                                                </TableCell>
                                            </>
                                        )}

                                        <TableCell>
                                            {user.rfidCode ? (
                                                <Badge variant="default">
                                                    {user.rfidCode}
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    Unassigned
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {filteredData.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="text-center text-muted-foreground"
                                        >
                                            No users found
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

            <AssignRFIDSidebar
                open={assignOpen}
                onOpenChange={setAssignOpen}
                orgId={orgId}
            />
        </>
    );
};

export default RFIDMappingPage;
