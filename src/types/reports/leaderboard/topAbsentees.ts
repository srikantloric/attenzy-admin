export interface TopAbsentee {
  userId: string
  name: string
  present: number
  absent: number
  leave: number
  totalWorkingDays: number
  attendancePercentage: number
  absencePercentage: number
  rank: number
}

export interface TopAbsenteesResponse {
  periodType: "MONTH" | "WEEK" | "RANGE"
  scope: string
  data: TopAbsentee[]
}