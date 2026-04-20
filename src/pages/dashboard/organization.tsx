import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { BellRing, Cpu, UserCheck, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import DeviceHealth from "@/components/DeviceHealth";
import DashboardCard from "@/components/DashboardCard";

import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import LiveAttendance from "@/components/LiveAttendance";
import LiveAttendanceWithDevice from "@/components/LiveAttendanceWithDevice";
import { AppBreadcrumb } from "@/components/AppBreadCrumb";

import useAuth from "@/hooks/useAuth";
import { getAttendanceByOrg } from "@/api/attendance";
import { listOrgDevices } from "@/api/device";
import { getUsersByOrg } from "@/api/users";

import type { AttendanceItem } from "@/types/attendance";
import type { Device } from "@/types/device";
import type { User } from "@/types/users";

function OrganizationDashboard() {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const [attendance, setAttendance] = useState<AttendanceItem[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const [attendanceRes, devicesRes, usersRes] = await Promise.all([
          getAttendanceByOrg(orgId),
          listOrgDevices(orgId),
          getUsersByOrg(orgId),
        ]);

        setAttendance(attendanceRes ?? []);
        setDevices(devicesRes.items ?? []);
        setUsers(usersRes ?? []);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [orgId]);

  const todayKey = format(new Date(), "yyyy-MM-dd");
  const timelineDays = 14;
  const chartColors = [
    "#0ea5e9",
    "#22c55e",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
    "#14b8a6",
  ];

  const getDateKeyFromTimestamp = (timestamp: number) =>
    format(new Date(timestamp), "yyyy-MM-dd");

  const formatTimeLabel = (timestamp: number | null | undefined) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const todayAttendance = useMemo(
    () =>
      attendance.filter(
        (item) => getDateKeyFromTimestamp(item.timestamp) === todayKey,
      ),
    [attendance, todayKey],
  );

  const attendanceCountByDate = useMemo(() => {
    return attendance.reduce((map, item) => {
      const key = getDateKeyFromTimestamp(item.timestamp);
      map.set(key, (map.get(key) ?? 0) + 1);
      return map;
    }, new Map<string, number>());
  }, [attendance]);

  const attendanceByDate = useMemo(() => {
    return Array.from({ length: timelineDays }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (timelineDays - 1 - index));
      const key = format(date, "yyyy-MM-dd");

      return {
        key,
        label: format(date, "dd MMM"),
        value: attendanceCountByDate.get(key) ?? 0,
      };
    });
  }, [attendanceCountByDate, timelineDays]);

  const latestAttendance = useMemo(
    () =>
      [...todayAttendance]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5),
    [todayAttendance],
  );

  const activeDevices = useMemo(
    () =>
      devices.filter(
        (device) => device.status === "ONLINE" || device.status === "IDLE",
      ),
    [devices],
  );

  const todayStudentCount = useMemo(() => {
    const studentIds = new Set(
      todayAttendance
        .filter((item) => item.userType === "STUDENT")
        .map((item) => item.userId),
    );

    return studentIds.size;
  }, [todayAttendance]);

  const todayFacultyCount = useMemo(() => {
    const facultyIds = new Set(
      todayAttendance
        .filter((item) => item.userType === "FACULTY")
        .map((item) => item.userId),
    );

    return facultyIds.size;
  }, [todayAttendance]);

  const totalStudents = useMemo(
    () => users.filter((item) => item.userType === "STUDENT").length,
    [users],
  );

  const totalFaculty = useMemo(
    () => users.filter((item) => item.userType === "FACULTY").length,
    [users],
  );

  const totalPeople = useMemo(
    () => totalStudents + totalFaculty,
    [totalStudents, totalFaculty],
  );

  const attendanceErrors = useMemo(
    () =>
      todayAttendance.filter(
        (item) => !item.deviceId || !item.deviceName || !item.rfidCode,
      ).length,
    [todayAttendance],
  );

  const todayUniqueAttendees = useMemo(
    () => new Set(todayAttendance.map((item) => item.userId)).size,
    [todayAttendance],
  );

  const todayAttendanceCoverage = useMemo(() => {
    if (!totalPeople) return 0;
    return Number(((todayUniqueAttendees / totalPeople) * 100).toFixed(1));
  }, [todayUniqueAttendees, totalPeople]);

  const inactiveDeviceCount = useMemo(
    () => Math.max(devices.length - activeDevices.length, 0),
    [devices.length, activeDevices.length],
  );

  const dailyInsights = useMemo(() => {
    const dateBuckets = new Map<
      string,
      {
        scans: number;
        users: Set<string>;
        students: Set<string>;
        faculty: Set<string>;
      }
    >();

    attendanceByDate.forEach((day) => {
      dateBuckets.set(day.key, {
        scans: 0,
        users: new Set<string>(),
        students: new Set<string>(),
        faculty: new Set<string>(),
      });
    });

    attendance.forEach((item) => {
      const key = getDateKeyFromTimestamp(item.timestamp);
      const bucket = dateBuckets.get(key);
      if (!bucket) return;

      bucket.scans += 1;
      bucket.users.add(item.userId);

      if (item.userType === "STUDENT") bucket.students.add(item.userId);
      if (item.userType === "FACULTY") bucket.faculty.add(item.userId);
    });

    return attendanceByDate.map((day) => {
      const bucket = dateBuckets.get(day.key);
      const uniqueUsers = bucket?.users.size ?? 0;
      const scans = bucket?.scans ?? 0;
      const studentUsers = bucket?.students.size ?? 0;
      const facultyUsers = bucket?.faculty.size ?? 0;
      const captureRate =
        totalPeople > 0
          ? Number(((uniqueUsers / totalPeople) * 100).toFixed(1))
          : 0;
      const scansPerUser =
        uniqueUsers > 0 ? Number((scans / uniqueUsers).toFixed(2)) : 0;

      return {
        ...day,
        scans,
        uniqueUsers,
        studentUsers,
        facultyUsers,
        captureRate,
        scansPerUser,
      };
    });
  }, [attendance, attendanceByDate, totalPeople]);

  const intradayScanPattern = useMemo(() => {
    const startHour = 6;
    const endHour = 21;
    const hourCounts = new Map<number, number>();

    for (let hour = startHour; hour <= endHour; hour += 1) {
      hourCounts.set(hour, 0);
    }

    todayAttendance.forEach((item) => {
      const sourceTs = item.firstScan ?? item.timestamp;
      const hour = new Date(sourceTs).getHours();
      if (hour >= startHour && hour <= endHour) {
        hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
      }
    });

    return Array.from(hourCounts.entries()).map(([hour, scans]) => ({
      hourLabel: `${String(hour).padStart(2, "0")}:00`,
      scans,
    }));
  }, [todayAttendance]);

  const attendanceSourceData = useMemo(() => {
    const sourceCounts = todayAttendance.reduce((map, item) => {
      const source = item.source?.trim() || "UNKNOWN";
      map.set(source, (map.get(source) ?? 0) + 1);
      return map;
    }, new Map<string, number>());

    return Array.from(sourceCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [todayAttendance]);

  const statusDistributionData = useMemo(() => {
    const latestByUser = new Map<string, AttendanceItem>();

    todayAttendance.forEach((item) => {
      const existing = latestByUser.get(item.userId);
      if (!existing || item.timestamp > existing.timestamp) {
        latestByUser.set(item.userId, item);
      }
    });

    const statusCounts = Array.from(latestByUser.values()).reduce(
      (map, item) => {
        const status = item.status?.trim() || "UNKNOWN";
        map.set(status, (map.get(status) ?? 0) + 1);
        return map;
      },
      new Map<string, number>(),
    );

    return Array.from(statusCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [todayAttendance]);

  const weeklyPerformanceRows = useMemo(
    () => [...dailyInsights].slice(-7).reverse(),
    [dailyInsights],
  );

  const alertItems = useMemo(() => {
    const items: {
      title: string;
      detail: string;
      level: "critical" | "warning" | "info";
    }[] = [];

    if (inactiveDeviceCount > 0) {
      items.push({
        title: "Device Connectivity Alert",
        detail: `${inactiveDeviceCount} devices are offline or inactive right now.`,
        level: "critical",
      });
    }

    if (attendanceErrors > 0) {
      items.push({
        title: "Attendance Quality Alert",
        detail: `${attendanceErrors} scans are missing device or RFID details.`,
        level: "warning",
      });
    }

    if (todayAttendanceCoverage < 70) {
      items.push({
        title: "Low Participation Alert",
        detail: `Today coverage is ${todayAttendanceCoverage}% across registered users.`,
        level: "warning",
      });
    }

    if (!items.length) {
      items.push({
        title: "Attendance Stream Healthy",
        detail: "No major attendance or device alerts at the moment.",
        level: "info",
      });
    }

    return items;
  }, [inactiveDeviceCount, attendanceErrors, todayAttendanceCoverage]);

  const openAlertCount = useMemo(
    () => alertItems.filter((item) => item.level !== "info").length,
    [alertItems],
  );

  const topIntradayHour = useMemo(() => {
    const activeHours = intradayScanPattern.filter((item) => item.scans > 0);
    if (!activeHours.length) return "-";

    return activeHours.reduce((best, current) =>
      current.scans > best.scans ? current : best,
    ).hourLabel;
  }, [intradayScanPattern]);

  if (!orgId) {
    return (
      <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
        Organization information not available. Please login again.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 p-2 lg:p-6 md:p-3">
        <AppBreadcrumb />
        <div className="text-sm text-muted-foreground">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-2 lg:p-6 md:p-3">
        <AppBreadcrumb />
        <div className="text-sm text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 lg:p-6 md:p-3">
      <AppBreadcrumb />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Organization Dashboard</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-9">
          <div className="grid gap-4 md:grid-cols-3">
            <DashboardCard
              title="Attendance Coverage"
              value={`${todayAttendanceCoverage}%`}
              trend={`+${todayUniqueAttendees}`}
              footerText="Today"
              icon={<Users className="h-4 w-4" />}
              cardIcon={<Users className="h-20 w-20" />}
              variant="default"
            />

            <DashboardCard
              title="Attendance Volume"
              value={`${todayAttendance.length}`}
              trend={`+${todayStudentCount + todayFacultyCount}`}
              footerText="Last 24 hours"
              icon={<UserCheck className="h-4 w-4" />}
              cardIcon={<UserCheck className="h-20 w-20" />}
              variant="light"
            />

            <DashboardCard
              title="Device Uptime"
              value={`${activeDevices.length} / ${devices.length}`}
              trend={inactiveDeviceCount > 0 ? `-${inactiveDeviceCount}` : "+0"}
              footerText="Live"
              icon={<Cpu className="h-4 w-4" />}
              cardIcon={<Cpu className="h-20 w-20" />}
              variant="light"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Trend (Last 14 Days)</CardTitle>
              <CardDescription>
                Unique attendees, scan volume, and capture rate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dailyInsights}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      minTickGap={20}
                    />
                    <YAxis
                      yAxisId="left"
                      tickLine={false}
                      axisLine={false}
                      width={36}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(value: number) => `${value}%`}
                      tickLine={false}
                      axisLine={false}
                      width={44}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="scans"
                      name="Total Scans"
                      fill="#0ea5e9"
                      radius={[6, 6, 0, 0]}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="uniqueUsers"
                      name="Unique Attendees"
                      stroke="#16a34a"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="captureRate"
                      name="Capture Rate"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Intraday Scan Pattern</CardTitle>
                <CardDescription>
                  Hourly attendance scan load for today.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={intradayScanPattern}>
                      <defs>
                        <linearGradient
                          id="scanLoad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#0284c7"
                            stopOpacity={0.55}
                          />
                          <stop
                            offset="95%"
                            stopColor="#0284c7"
                            stopOpacity={0.08}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="hourLabel"
                        tickLine={false}
                        axisLine={false}
                        minTickGap={18}
                      />
                      <YAxis tickLine={false} axisLine={false} width={32} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="scans"
                        name="Scans"
                        stroke="#0284c7"
                        fill="url(#scanLoad)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today Source Mix</CardTitle>
                <CardDescription>
                  Attendance sources captured in real time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceSourceData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={78}
                        paddingAngle={2}
                      >
                        {attendanceSourceData.map((_, index) => (
                          <Cell
                            key={`src-${index}`}
                            fill={chartColors[index % chartColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>7-Day Attendance Performance Table</CardTitle>
              <CardDescription>
                Daily participation and scan quality by cohort.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Unique Attendees</TableHead>
                    <TableHead>Total Scans</TableHead>
                    <TableHead>Capture Rate</TableHead>
                    <TableHead>Avg Scans / User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeklyPerformanceRows.map((row) => (
                    <TableRow key={row.key}>
                      <TableCell className="font-medium">{row.label}</TableCell>
                      <TableCell>{row.studentUsers}</TableCell>
                      <TableCell>{row.facultyUsers}</TableCell>
                      <TableCell>{row.uniqueUsers}</TableCell>
                      <TableCell>{row.scans}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.captureRate}%</Badge>
                      </TableCell>
                      <TableCell>{row.scansPerUser}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Latest Attendance Status Distribution</CardTitle>
              <CardDescription>
                Most recent status per attendee for today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={statusDistributionData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={32} />
                    <Tooltip />
                    <Bar dataKey="value" name="People" radius={[6, 6, 0, 0]}>
                      {statusDistributionData.map((_, index) => (
                        <Cell
                          key={`status-${index}`}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-3">
          <Card className="overflow-hidden  p-0">
            <div className="bg-linear-to-br from-teal-900 to-emerald-700 p-4 text-white">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Attendance Status</h3>
                <BellRing className="h-5 w-5" />
              </div>
              <p className="mt-1 text-xs text-emerald-100">
                Real-time attendance monitoring and alerts.
              </p>
            </div>
            <CardContent className="space-y-3 p-4">
              {alertItems.slice(0, 2).map((item) => (
                <div
                  key={item.title}
                  className={
                    item.level === "critical"
                      ? "rounded-md border border-red-200 bg-red-50 p-3"
                      : item.level === "warning"
                        ? "rounded-md border border-amber-200 bg-amber-50 p-3"
                        : "rounded-md border border-blue-200 bg-blue-50 p-3"
                  }
                >
                  <p className="text-xs font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
              ))}

              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Open Alerts</p>
                <p className="text-lg font-semibold">{openAlertCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Operational signals requiring attention.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span className="text-muted-foreground">Attendance Errors</span>
                <Badge
                  variant={attendanceErrors > 0 ? "destructive" : "outline"}
                >
                  {attendanceErrors}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span className="text-muted-foreground">Offline Devices</span>
                <Badge
                  variant={inactiveDeviceCount > 0 ? "destructive" : "outline"}
                >
                  {inactiveDeviceCount}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span className="text-muted-foreground">Peak Hour</span>
                <Badge variant="outline">{topIntradayHour}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span className="text-muted-foreground">Latest Scan</span>
                <span className="font-medium">
                  {latestAttendance[0]
                    ? formatTimeLabel(latestAttendance[0].timestamp)
                    : "-"}
                </span>
              </div>
            </CardContent>
          </Card>

          <LiveAttendance records={latestAttendance} loading={loading} />
          <LiveAttendanceWithDevice
            records={latestAttendance}
            loading={loading}
          />
          <DeviceHealth devices={devices} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default OrganizationDashboard;
