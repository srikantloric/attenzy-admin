export type StudentStatus = "assigned" | "unassigned" | "invalid";

export interface Student {
  id: number;
  name: string;
  contact: string;
  classSection: string | null;
  rfid: string | null;
  status: StudentStatus;
  lastSeen: string;
}

export const studentsData: Student[] = [
  {
    id: 1001,
    name: "Rahul Sen",
    contact: "555-1234",
    classSection: "9A",
    rfid: "1234 5678 1234",
    status: "assigned",
    lastSeen: "2 min ago"
  },
  {
    id: 1002,
    name: "Priya Kaur",
    contact: "555-5678",
    classSection: "10B",
    rfid: "4567 8912 4567",
    status: "assigned",
    lastSeen: "3 min ago"
  },
  {
    id: 1003,
    name: "Arjun Patel",
    contact: "555-9876",
    classSection: "8A",
    rfid: "7891 2245 6789",
    status: "assigned",
    lastSeen: "6 min ago"
  },
  {
    id: 1004,
    name: "Resha Das",
    contact: "555-6765",
    classSection: null,
    rfid: null,
    status: "unassigned",
    lastSeen: "10 min ago"
  },
  {
    id: 1005,
    name: "Sameer Khan",
    contact: "555-9496",
    classSection: null,
    rfid: null,
    status: "invalid",
    lastSeen: "5 min ago"
  }
];
