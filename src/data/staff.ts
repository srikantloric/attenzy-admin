export type StaffStatus = "valid" | "invalid";

export interface Staff {
  id: number;
  name: string;
  contact: string;
  position: string;
  rfid: string | null;
  lastSeen: string;
  status: StaffStatus;
}

export const staffData: Staff[] = [
  {
    id: 1001,
    name: "Rajesh Gupta",
    contact: "556-0001",
    position: "Administrator",
    rfid: "9676 7991 1234",
    lastSeen: "Just now",
    status: "valid"
  },
  {
    id: 1002,
    name: "Ananya Verma",
    contact: "556-1112",
    position: "IT Support",
    rfid: "7891 4637 5238",
    lastSeen: "2 min ago",
    status: "valid"
  },
  {
    id: 1003,
    name: "Vikram Joshi",
    contact: "555-2225",
    position: "Librarian",
    rfid: "1234 6788 6678",
    lastSeen: "10 min ago",
    status: "valid"
  },
  {
    id: 1004,
    name: "Sunita Pal",
    contact: "555-5324",
    position: "Security Guard (Block B)",
    rfid: null,
    lastSeen: "5 min ago",
    status: "invalid"
  },
  {
    id: 1005,
    name: "Dipesh Yadav",
    contact: "555-4466",
    position: "Janitor",
    rfid: "2246 6789 2345",
    lastSeen: "15 min ago",
    status: "valid"
  }
];
