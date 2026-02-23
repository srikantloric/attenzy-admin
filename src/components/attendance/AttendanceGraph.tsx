import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

interface Props {
  days: string[]
  users: any[]
}

export default function AttendanceGraph({ days, users }: Props) {
  const trendData = days.map((day) => {
    let presentCount = 0

    users.forEach((user) => {
      if (user.attendance?.[day] === "PRESENT") {
        presentCount++
      }
    })

    return { day, present: presentCount }
  })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={trendData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="present" stroke="#16a34a" />
      </LineChart>
    </ResponsiveContainer>
  )
}