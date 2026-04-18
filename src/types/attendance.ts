export interface AttendanceItem {
  orgId: string
  date: string
  userId: string
  userType: string
  userName: string
  profilePhoto: string | null

  userProfile: {
    rollNumber?: string | null
    class?: string
    section?: string
    department?: string
  }

  status: string
  source: string

  firstScan: number | null
  lastScan: number | null
  totalScans: number

  deviceId: string | null
  deviceName: string | null

  timestamp: number
  rfidCode: string | null

  createdAt: number
  updatedAt: number
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
