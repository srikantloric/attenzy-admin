import { useState, useEffect, useMemo } from "react";

import useAuth from "@/hooks/useAuth";
import { getClassLeaderboard } from "@/api/reports/leaderboard/classLeaderboard";
import type { StudentRanking } from "@/types/reports/leaderboard/classLeaderboard";

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

export default function ClassLeaderboard() {
  const { user } = useAuth();
  const orgId = user?.orgId ?? "";

  /* ================= STATE ================= */

  const [month, setMonth] = useState("02");
  const [year, setYear] = useState("2026");

  const [classId, setClassId] = useState("");
  const [grades, setGrades] = useState<AcademicItem[]>([]);

  const [data, setData] = useState<StudentRanking[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

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

  /* ================= GENERATE ================= */

  const handleGenerate = async () => {
    if (!orgId || !classId) return;

    try {
      setLoading(true);

      const res = await getClassLeaderboard({
        orgId,
        periodType: "MONTH",
        month: `${year}-${month}`,
        classId,
      });

      setData(res.ranking);
    } catch (err) {
      console.error(err);
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
          View top attendance performers by class
        </p>
      </div>

      {/* FILTER */}
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard Filters</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap items-center gap-4 bg-muted/30 p-4 rounded-lg border">
            
            {/* CLASS */}
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

            {/* MONTH */}
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* YEAR */}
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {["2026", "2025", "2024"].map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* BUTTON */}
            <div className="ml-auto">
              <Button onClick={handleGenerate}>
                {loading ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>
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

                {/* HEADER */}
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left">Rank</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-center">User ID</th>
                    <th className="p-3 text-center">Days</th>
                    <th className="p-3 text-center">Present</th>
                    <th className="p-3 text-center">Attendance %</th>
                  </tr>
                </thead>

                {/* BODY */}
                <tbody>
                  {filteredData.map((s) => (
                    <tr
                      key={s.userId}
                      className="border-b hover:bg-muted/40 transition"
                    >
                      {/* Rank */}
                      <td className="p-3 font-semibold flex items-center gap-2">
                        {s.rank <= 3 && (
                          <Trophy
                            className={`h-4 w-4 ${
                              s.rank === 1
                                ? "text-yellow-500"
                                : s.rank === 2
                                ? "text-gray-400"
                                : "text-amber-600"
                            }`}
                          />
                        )}
                        #{s.rank}
                      </td>

                      {/* Name */}
                      <td className="p-3">{s.name}</td>

                      {/* User ID */}
                      <td className="p-3 text-center text-muted-foreground">
                        {s.userId}
                      </td>

                      {/* Total Days */}
                      <td className="p-3 text-center">
                        {s.totalWorkingDays}
                      </td>

                      {/* Present */}
                      <td className="p-3 text-center text-green-600 font-medium">
                        {s.present}
                      </td>

                      {/* Attendance */}
                      <td className="p-3 text-center">
                        <Badge variant="secondary">
                          {s.attendancePercentage}%
                        </Badge>
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