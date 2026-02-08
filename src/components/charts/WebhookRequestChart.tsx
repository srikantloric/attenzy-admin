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

/* -------------------- Mock Data -------------------- */

const webhookChartData = [
    { date: "2024-06-01", delivered: 420, failed: 8 },
    { date: "2024-06-02", delivered: 390, failed: 4 },
    { date: "2024-06-03", delivered: 480, failed: 12 },
    { date: "2024-06-04", delivered: 410, failed: 6 },
    { date: "2024-06-05", delivered: 520, failed: 15 },
]

/* -------------------- Chart Config -------------------- */

const chartConfig = {
    delivered: {
        label: "Delivered",
        color: "var(--chart-1)",
    },
    failed: {
        label: "Failed",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

/* -------------------- Component -------------------- */

export function WebhookRequestsChart() {
    const [timeRange, setTimeRange] = React.useState("7d")

    return (
        <Card className="pt-0 overflow-hidden">
            {/* Header */}
            <CardHeader className="flex items-center gap-2 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>Webhook Deliveries</CardTitle>
                    <CardDescription>
                        Delivery success vs failures
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
                        <AreaChart data={webhookChartData}>
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
                                dataKey="delivered"
                                type="natural"
                                fill="var(--color-delivered)"
                                stroke="var(--color-delivered)"
                                stackId="a"
                            />

                            <Area
                                dataKey="failed"
                                type="natural"
                                fill="var(--color-failed)"
                                stroke="var(--color-failed)"
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
