export interface AttendanceItem {
  orgId: string
  userId: string
  userType: string
  userName: string
  userProfile: {
    rollNumber: string
    class: string
    section: string
    department: string
  }
  deviceId: string
  deviceName: string
  rfidCode: string
  timestamp: number
}

export interface AttendanceResponse {
  count: number
  items: AttendanceItem[]
}


export type AttendanceStatus = "PRESENT" | "ABSENT" | "LEAVE" | "HALF_DAY"|"HOLIDAY"

export type CalanderApiResponse = {
  month: string
  days: string[]
  users: {
    userId: string
    name: string
    attendance: Record<string, AttendanceStatus>
    summary: {
      present: number
      absent: number
      leave: number
      holiday: number
      attendancePercentage: number
    }
  }[]
}
