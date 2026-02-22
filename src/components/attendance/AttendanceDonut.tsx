
import { Pie, PieChart, Label } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type Props = {
  percentage: number
}

export function AttendanceDonut({ percentage }: Props) {
  const value = Math.min(Math.max(percentage, 0), 100)

  const chartData = [
    { name: "Present", value, fill: "var(--chart-1)" },
    { name: "Remaining", value: 100 - value, fill: "var(--muted)" },
  ]

  const chartConfig = {
    value: {
      label: "Attendance",
    },
    Present: {
      label: "Present %",
      color: "var(--chart-3)",
    },
    Remaining: {
      label: "Remaining",
      color: "var(--muted)",
    },
  } satisfies ChartConfig

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-50"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />

        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={50}
          strokeWidth={5}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-2xl font-bold"
                    >
                      {value}%
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 20}
                      className="fill-muted-foreground text-xs"
                    >
                      Attendance
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}