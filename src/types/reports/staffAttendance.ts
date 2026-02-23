export interface StaffSummary {
  present: number
  absent: number
  leave: number
  holiday: number
  workingDays: number
  attendancePercentage: number
}

export interface StaffUser {
  userId: string
  name: string
  userType: "STAFF"
  attendance: Record<string, string>
  summary: StaffSummary
}

export interface StaffCalendarResponse {
  month: string
  days: string[]
  overallSummary: {
    present: number
    absent: number
    leave: number
    holiday: number
  }
  users: StaffUser[]
}