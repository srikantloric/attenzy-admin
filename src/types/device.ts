export type DeviceStatus =
  | "ONLINE"
  | "OFFLINE"
  | "IDLE"
  | "INACTIVE"
  | "MAINTENANCE"
  | "DECOMMISSIONED"
  | "SYNCHRONIZING"

export interface Device {
  deviceId: string
  serialNumber: string

  orgId: string
  orgName: string

  partnerId: string
  partnerCompany: string

  location: string
  description?: string

  status: DeviceStatus

  wifi?: {
    rssi: number        
    ssid?: string
    ip?: string
    updatedAt: number
  }

  lastSeen: number

  createdAt: number
  updatedAt: number
}

export interface GetDevicesResponse {
  items: Device[]
}
