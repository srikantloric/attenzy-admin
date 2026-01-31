export type AttendanceStatus =
  | "present"
  | "absent"
  | "halfday"
  | "leave"
  | "sick";

export interface AttendanceRecord {
  id: number;
  name: string;
  role: "student" | "faculty" | "staff";
  classSection?: string;
  status: AttendanceStatus;
  lastSeen?: string;
}

export const attendanceData: AttendanceRecord[] = [
  {
    id: 1001,
    name: "Rahul Sen",
    role: "student",
    classSection: "9A",
    status: "present",
    lastSeen: "Just now"
  },
  {
    id: 1002,
    name: "Priya Kaur",
    role: "student",
    classSection: "10B",
    status: "absent"
  },
  {
    id: 2001,
    name: "Jennifer Kapoor",
    role: "faculty",
    status: "present",
    lastSeen: "2 min ago"
  },
  {
    id: 3001,
    name: "Sunita Pal",
    role: "staff",
    status: "absent"
  }
];
