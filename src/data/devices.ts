export type DeviceStatus = "active" | "inactive"

export type Device = {
  id: string
  name: string
  location: string
  organization: string   
  status: DeviceStatus
  lastSeen: string
}

export const devicesData: Device[] = [
  {
    id: "RF1234",
    name: "RF1234",
    location: "Main Gate",
    organization: "Unified Tech",
    status: "active",
    lastSeen: "3 sec ago"
  },
  {
    id: "RF5678",
    name: "RF5678",
    location: "Admin Building",
    organization: "Connect Solutions",
    status: "active",
    lastSeen: "8 sec ago"
  },
    {
    id: "RF3412",
    name: "RF3412",
    location: "Library",
    organization: "EduSmart Technologies",
    status: "active",
    lastSeen: "16 sec ago"
  },
  {
    id: "RF9087",
    name: "RF9087",
    location: "Lab 1",
    organization: "SafePass Services",
    status: "active",
    lastSeen: "28 sec ago"
  },
  {
    id: "RF6523",
    name: "RF6523",
    location: "Gymnasium",
    organization: "Trackify Systems",
    status: "active",
    lastSeen: "34 sec ago"
  },
  {
    id: "RF2256",
    name: "RF2256",
    location: "Parking Lot",
    organization: "Beacon Edge",
    status: "inactive",
    lastSeen: "54 sec ago"
  },
]

