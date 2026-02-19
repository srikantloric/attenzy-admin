export interface AttendanceItem {
  orgId: string
  userId: string
  userName: string
  userProfile: {
    rollNumber: string
    class: string
    section: string
  }
  deviceId: string
  deviceName: string
  rfidCode: string
  timestamp: number
  date: string
  time: string
}

export interface AttendanceResponse {
  count: number
  items: AttendanceItem[]
}
