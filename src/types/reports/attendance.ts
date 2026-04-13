export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LEAVE"
  | "HOLIDAY"

export interface AttendanceSummary {
  present: number
  absent: number
  leave: number
  holiday: number
  workingDays: number
  attendancePercentage: number
}

export interface AttendanceUser {
  userId: string
  name: string
  profilePhoto?: string 
  attendance: Record<string, AttendanceStatus>
  summary: AttendanceSummary
}

export interface AttendanceCalendarResponse {
  month: string
  days: string[]
  overallSummary: {
    present: number
    absent: number
    leave: number
    holiday: number
  }
  users: AttendanceUser[]
}