export type DeviceStatus = "active" | "inactive";

export interface Device {
  id: number;
  name: string;
  location: string;
  ip: string;
  status: DeviceStatus;
  lastSeen: string;
}

export const devicesData: Device[] = [
  {
    id: 1,
    name: "Science Lab 3",
    location: "Science Lab",
    ip: "192.168.1.20",
    status: "active",
    lastSeen: "Just now"
  },
  {
    id: 2,
    name: "Main Gate",
    location: "Main Gate",
    ip: "192.168.1.10",
    status: "active",
    lastSeen: "1 min ago"
  },
  {
    id: 3,
    name: "Block A Entrance",
    location: "Block A",
    ip: "192.168.1.30",
    status: "inactive",
    lastSeen: "10 min ago"
  },
  {
    id: 4,
    name: "Library Gate",
    location: "Library",
    ip: "192.168.1.40",
    status: "inactive",
    lastSeen: "1 hr ago"
  }
];
