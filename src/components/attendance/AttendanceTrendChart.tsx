
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts"
import { TrendingUp } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { format } from "date-fns"

const mockTrendData = [
    { month: "2025-04", percentage: 82 },
    { month: "2025-05", percentage: 100 },
    { month: "2025-06", percentage: 85 },
    { month: "2025-07", percentage: 88 },
    { month: "2025-08", percentage: 91 },
    { month: "2025-09", percentage: 87 },
    { month: "2025-10", percentage: 83 },
    { month: "2025-11", percentage: 10 },
    { month: "2025-12", percentage: 81 },
    { month: "2026-01", percentage: 86 },
    { month: "2026-02", percentage: 20 },
    { month: "2026-03", percentage: 92 },
]

const chartConfig = {
    percentage: {
        label: "Attendance %",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

export function AttendanceTrendChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Attendance Trend %</CardTitle>
                <CardDescription>Apr 2025 – Mar 2026</CardDescription>
            </CardHeader>

            <CardContent>
                <ChartContainer config={chartConfig} className="w-full h-37.5">
                    <LineChart
                        data={mockTrendData}
                        margin={{ top: 40, left: 8, right: 8 }}
                    >
                        <CartesianGrid vertical={false} />

                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) =>
                                format(new Date(value + "-01"), "MMM")
                            }
                        />

                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />

                        <Line
                            dataKey="percentage"
                            type="natural"
                            stroke="var(--color-percentage)"
                            strokeWidth={2}
                            dot={{ fill: "var(--color-percentage)" }}
                            activeDot={{ r: 6 }}
                        >
                            <LabelList
                                dataKey="percentage"
                                position="top"
                                offset={12}
                                className="fill-foreground text-xs"
                            />
                        </Line>
                    </LineChart>
                </ChartContainer>
            </CardContent>

            <CardFooter className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Monthly attendance performance
            </CardFooter>
        </Card>
    )
}