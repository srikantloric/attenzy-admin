export interface FacultySummary {
  present: number
  absent: number
  leave: number
  holiday: number
  workingDays: number
  attendancePercentage: number
}

export interface FacultyUser {
  userId: string
  name: string
  userType: "FACULTY"
  attendance: Record<string, string>
  summary: FacultySummary
}

export interface FacultyCalendarResponse {
  month: string
  days: string[]
  overallSummary: {
    present: number
    absent: number
    leave: number
    holiday: number
  }
  users: FacultyUser[]
}