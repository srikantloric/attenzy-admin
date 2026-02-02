export type DeviceStatus = "online" | "offline";

export interface DeviceHealth {
  id: string;
  name: string;
  location: string;
  status: DeviceStatus;
  sensorStatus: DeviceStatus;
  signalBars: number; // 0–4
  alerts: number;
  lastActivity: string;
}

export const deviceHealthData: DeviceHealth[] = [
  {
    id: "001",
    name: "Main Gate",
    location: "Main Entrance",
    status: "online",
    sensorStatus: "online",
    signalBars: 4,
    alerts: 0,
    lastActivity: "Just now"
  },
  {
    id: "002",
    name: "Block A",
    location: "Building A",
    status: "online",
    sensorStatus: "online",
    signalBars: 4,
    alerts: 0,
    lastActivity: "2 min ago"
  },
  {
    id: "003",
    name: "Block B",
    location: "Building B",
    status: "offline",
    sensorStatus: "offline",
    signalBars: 0,
    alerts: 2,
    lastActivity: "5 min ago"
  },
  {
    id: "004",
    name: "Lab 1",
    location: "Science Lab 1",
    status: "online",
    sensorStatus: "online",
    signalBars: 4,
    alerts: 0,
    lastActivity: "5 min ago"
  },
  {
    id: "005",
    name: "Lab 2",
    location: "Science Lab 2",
    status: "online",
    sensorStatus: "offline",
    signalBars: 0,
    alerts: 2,
    lastActivity: "1 min ago"
  },
  {
    id: "006",
    name: "Library",
    location: "Main Library",
    status: "online",
    sensorStatus: "online",
    signalBars: 4,
    alerts: 0,
    lastActivity: "15 min ago"
  }
];
