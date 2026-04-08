import { useState, useEffect, useMemo } from "react";

import useAuth from "@/hooks/useAuth";
import { getClassLeaderboard } from "@/api/reports/leaderboard/studentLeaderboard";
import type { StudentRanking } from "@/types/reports/leaderboard/studentLeaderboard";

import { listGrades } from "@/api/academics";
import type { AcademicItem } from "@/types/academics";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

export default function StudentLeaderboard() {
    const { user } = useAuth();
    const orgId = user?.orgId ?? "";

    /* ================= STATE ================= */

    const [periodType, setPeriodType] = useState<
        "MONTH" | "WEEK" | "RANGE"
    >("MONTH");

    const [month, setMonth] = useState("02");
    const [year, setYear] = useState("2026");
    const [week, setWeek] = useState("2026-W08");

    const [startMonth, setStartMonth] = useState("01");
    const [endMonth, setEndMonth] = useState("03");

    const [classId, setClassId] = useState("");
    const [grades, setGrades] = useState<AcademicItem[]>([]);

    const [data, setData] = useState<StudentRanking[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    /* ================= FETCH CLASSES ================= */

    useEffect(() => {
        if (!orgId) return;

        const fetchGrades = async () => {
            try {
                const res = await listGrades(orgId);
                setGrades(res);
            } catch (err) {
                console.error(err);
            }
        };

        fetchGrades();
    }, [orgId]);

    /* ================= RESET ================= */

    useEffect(() => {
        setData([]);
        setError("");
    }, [periodType]);

    /* ================= GENERATE ================= */

    const handleGenerate = async () => {
        if (!orgId) return;

        if (!classId) {
            setError("Please select a class");
            return;
        }

        setLoading(true);
        setError("");

        try {
            let response;

            /* MONTH */
            if (periodType === "MONTH") {
                response = await getClassLeaderboard({
                    orgId,
                    periodType: "MONTH",
                    month: `${year}-${month}`,
                    classId,
                });
            }

            /* WEEK */
            else if (periodType === "WEEK") {
                response = await getClassLeaderboard({
                    orgId,
                    periodType: "WEEK",
                    week,
                    classId,
                });
            }

            /* RANGE */
            else if (periodType === "RANGE") {
                const start = `${year}-${startMonth}`;
                const end = `${year}-${endMonth}`;

                if (start > end) {
                    setError("From month cannot be after To month");
                    setLoading(false);
                    return;
                }

                response = await getClassLeaderboard({
                    orgId,
                    periodType: "RANGE",
                    startMonth: start,
                    endMonth: end,
                    classId,
                });
            }

            setData(response?.ranking || []);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch leaderboard");
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    /* ================= SEARCH ================= */

    const filteredData = useMemo(() => {
        return data.filter((s) =>
            s.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [data, search]);

    /* ================= MONTHS ================= */

    const months = [
        { value: "01", label: "January" },
        { value: "02", label: "February" },
        { value: "03", label: "March" },
        { value: "04", label: "April" },
        { value: "05", label: "May" },
        { value: "06", label: "June" },
        { value: "07", label: "July" },
        { value: "08", label: "August" },
        { value: "09", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" },
    ];

    /* ================= UI ================= */

    return (
        <div className="py-6 space-y-6">
            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Class Leaderboard
                </h1>
                <p className="text-sm text-muted-foreground">
                    View attendance rankings across different time periods
                </p>
            </div>

            {/* FILTER */}
            <Card>
                <CardHeader>
                    <CardTitle>Leaderboard Filters</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-wrap items-end gap-4 bg-muted/30 p-4 rounded-lg border">

                        {/* PERIOD */}
                        <div className="flex flex-col space-y-1">
                            <p className="text-xs text-muted-foreground">Period</p>
                            <Select value={periodType} onValueChange={(v) => setPeriodType(v as any)}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MONTH">Monthly</SelectItem>
                                    <SelectItem value="WEEK">Weekly</SelectItem>
                                    <SelectItem value="RANGE">Range</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* CLASS */}
                        <div className="flex flex-col space-y-1">
                            <p className="text-xs text-muted-foreground">Class</p>
                            <Select value={classId} onValueChange={setClassId}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {grades.map((g) => (
                                        <SelectItem key={g.gradeId} value={g.name}>
                                            {g.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* MONTH */}
                        {periodType === "MONTH" && (
                            <>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-xs text-muted-foreground">Month</p>
                                    <Select value={month} onValueChange={setMonth}>
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {months.map((m) => (
                                                <SelectItem key={m.value} value={m.value}>
                                                    {m.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col space-y-1">
                                    <p className="text-xs text-muted-foreground">Year</p>
                                    <Select value={year} onValueChange={setYear}>
                                        <SelectTrigger className="w-[110px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["2026", "2025", "2024"].map((y) => (
                                                <SelectItem key={y} value={y}>{y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}

                        {/* WEEK */}
                        {periodType === "WEEK" && (
                            <div className="flex flex-col space-y-1">
                                <p className="text-xs text-muted-foreground">Week</p>
                                <Input
                                    type="week"
                                    className="w-[180px]"
                                    value={week}
                                    onChange={(e) => setWeek(e.target.value)}
                                />
                            </div>
                        )}

                        {/* RANGE */}
                        {periodType === "RANGE" && (
                            <>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-xs text-muted-foreground">From</p>
                                    <Input
                                        type="month"
                                        className="w-[160px]"
                                        value={`${year}-${startMonth}`}
                                        onChange={(e) => {
                                            const [y, m] = e.target.value.split("-");
                                            setYear(y);
                                            setStartMonth(m);
                                        }}
                                    />
                                </div>

                                <div className="flex flex-col space-y-1">
                                    <p className="text-xs text-muted-foreground">To</p>
                                    <Input
                                        type="month"
                                        className="w-[160px]"
                                        value={`${year}-${endMonth}`}
                                        onChange={(e) => {
                                            const [_, m] = e.target.value.split("-");
                                            setEndMonth(m);
                                        }}
                                    />
                                </div>
                            </>
                        )}

                        {/* BUTTON */}
                        <div className="ml-auto">
                            <Button onClick={handleGenerate} disabled={!classId || loading}>
                                {loading ? "Generating..." : "Generate"}
                            </Button>
                        </div>

                    </div>

                    {error && (
                        <p className="text-sm text-red-500 mt-3">{error}</p>
                    )}
                </CardContent>
            </Card>

            {/* TABLE */}
            {data.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Leaderboard</CardTitle>

                        <Input
                            placeholder="Search student..."
                            className="w-60"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="p-3 text-left">Rank</th>
                                        <th className="p-3 text-left">Name</th>
                                        <th className="p-3 text-center">Days</th>
                                        <th className="p-3 text-center">Present</th>
                                        <th className="p-3 text-center">Attendance %</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredData.map((s) => (
                                        <tr key={s.userId} className="border-b hover:bg-muted/40">
                                            <td className="p-3 font-semibold flex items-center gap-2">
                                                {s.rank <= 3 && (
                                                    <Trophy className="h-4 w-4 text-yellow-500" />
                                                )}
                                                #{s.rank}
                                            </td>
                                            <td className="p-3">{s.name}</td>
                                            <td className="p-3 text-center">{s.totalWorkingDays}</td>
                                            <td className="p-3 text-center text-green-600">
                                                {s.present}
                                            </td>
                                            <td className="p-3 text-center">
                                                <Badge>{s.attendancePercentage}%</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* EMPTY */}
            {!loading && data.length === 0 && (
                <Card>
                    <CardContent className="py-6 text-center text-muted-foreground">
                        Generate report to view leaderboard
                    </CardContent>
                </Card>
            )}
        </div>
    );
}