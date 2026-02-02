import { useMemo, useState } from "react";
import { facultyData } from "@/data/faculty";
import type { Faculty } from "@/data/faculty";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { Search, Filter, Plus } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const TOTAL_FACULTY = 84;

const FacultyPage: React.FC = () => {
    const [search, setSearch] = useState<string>("");
    type FilterType = "all" | "invalid";

    const [filter, setFilter] = useState<FilterType>("all");

    const filteredFaculty = useMemo<Faculty[]>(() => {
        return facultyData.filter((faculty) => {
            const matchesSearch = faculty.name
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesFilter =
                filter === "all" ? true : faculty.rfid === null;

            return matchesSearch && matchesFilter;
        });
    }, [search, filter]);

    return (
        <div className="space-y-6 p-6">

            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    {/* Left: Title + Count */}
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Faculty
                        </h1>

                        <span className="rounded-md bg-muted px-2 py-0.5 text-sm text-muted-foreground">
                            {TOTAL_FACULTY}
                        </span>
                    </div>

                    {/* Right: Action */}
                    <Button className="gap-2 bg-primary">
                        <Plus className="h-4 w-4" />
                        Add Faculty
                    </Button>
                </div>


                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>
                        Total Faculty:
                        <span className="ml-1 font-medium text-foreground">
                            {TOTAL_FACULTY}
                        </span>
                    </span>

                    <span className="flex items-center gap-1 text-green-600">
                        +3
                        <span className="text-muted-foreground">added</span>
                    </span>

                    <span className="flex items-center gap-1 text-red-500">
                        -2
                        <span className="text-muted-foreground">removed</span>
                    </span>
                </div>
            </div>


            <Separator />

            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Left: Toggle Filters */}
                <div className="flex items-center gap-2">
                    <Button
                        variant={filter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("all")}
                    >
                        All
                    </Button>

                    <Button
                        variant={filter === "invalid" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("invalid")}
                    >
                        Invalid
                    </Button>
                </div>

                {/* Right: Search + Advanced Filter */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="w-64 pl-8"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Department</DropdownMenuItem>
                            <DropdownMenuItem>RFID Status</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table */}
            <Card>
                <CardContent className="">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>RFID Card Number</TableHead>
                                <TableHead className="text-right">
                                    Last Seen
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredFaculty.map((faculty) => (
                                <TableRow key={faculty.id}>
                                    <TableCell>{faculty.id}</TableCell>

                                    <TableCell className="font-medium">
                                        {faculty.name}
                                    </TableCell>

                                    <TableCell>{faculty.contact}</TableCell>

                                    <TableCell>{faculty.department}</TableCell>

                                    <TableCell>
                                        {faculty.rfid ? (
                                            faculty.rfid
                                        ) : (
                                            <Badge variant="destructive">Invalid</Badge>
                                        )}
                                    </TableCell>

                                    <TableCell className="text-right text-muted-foreground">
                                        {faculty.lastSeen}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>

                <Separator />
                
                {/* Pagination */}
                <div className="flex items-center justify-end gap-4 mr-4">
                    <Field orientation="horizontal" className="w-fit">
                        <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel>
                        <Select defaultValue="25">
                            <SelectTrigger className="w-20" id="select-rows-per-page">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="start">
                                <SelectGroup>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Pagination className="mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#" />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext href="#" />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </Card>


        </div>
    );
};

export default FacultyPage;
