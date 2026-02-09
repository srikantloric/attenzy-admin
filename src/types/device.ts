export type DeviceStatus =
  | "ONLINE"
  | "OFFLINE"
  | "IDLE"
  | "INACTIVE"

export interface Device {
  deviceId: string
  serialNumber: string
  orgId: string
  partnerId: string
  location: string
  description?: string

  status: DeviceStatus
  
  createdAt: number
  updatedAt: number
}

export interface GetDevicesResponse {
  items: Device[]
}
