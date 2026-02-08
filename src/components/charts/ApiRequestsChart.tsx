"use client"

import * as React from "react"
import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
    ResponsiveContainer,
} from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

/* -------------------- Data -------------------- */

const apiChartData = [
    { date: "2024-06-01", success: 1240, error: 32 },
    { date: "2024-06-02", success: 980, error: 21 },
    { date: "2024-06-03", success: 1540, error: 44 },
    { date: "2024-06-04", success: 1120, error: 18 },
    { date: "2024-06-05", success: 1680, error: 55 },
    { date: "2024-06-06", success: 1430, error: 29 },
    { date: "2024-06-07", success: 1780, error: 63 },
]

/* -------------------- Chart Config -------------------- */

const chartConfig = {
    success: {
        label: "Successful Requests",
        color: "var(--chart-1)",
    },
    error: {
        label: "Failed Requests",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

/* -------------------- Component -------------------- */

export function ApiRequestsChart() {
    const [timeRange, setTimeRange] = React.useState("7d")

    const filteredData = apiChartData.slice(
        timeRange === "7d" ? -7 : timeRange === "30d" ? -30 : -90
    )

    return (
        <Card className="pt-0 overflow-hidden">
            {/* Header */}
            <CardHeader className="flex items-center gap-2 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>API Requests</CardTitle>
                    <CardDescription>
                        Successful vs failed API requests
                    </CardDescription>
                </div>

                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>

            {/* Chart */}
            <CardContent className="px-2 pt-4 sm:px-6 overflow-hidden">
                <ChartContainer
                    config={chartConfig}
                    className="h-[250px] w-full"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredData}>
                            <defs>
                                <linearGradient id="fillSuccess" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0.1} />
                                </linearGradient>

                                <linearGradient id="fillError" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-error)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-error)" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid vertical={false} />

                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={24}
                            />

                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />

                            <Area
                                dataKey="success"
                                type="natural"
                                fill="url(#fillSuccess)"
                                stroke="var(--color-success)"
                                stackId="a"
                            />

                            <Area
                                dataKey="error"
                                type="natural"
                                fill="url(#fillError)"
                                stroke="var(--color-error)"
                                stackId="a"
                                opacity={0.7}
                            />

                            <ChartLegend content={<ChartLegendContent />} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
