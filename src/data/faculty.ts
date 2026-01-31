export interface Faculty {
  id: number;
  name: string;
  contact: string;
  department: string;
  rfid: string | null;
  lastSeen: string;
}

export const facultyData: Faculty[] = [
  {
    id: 1001,
    name: "Jennifer Kapoor",
    contact: "555-4233",
    department: "Mathematics",
    rfid: "6700 1234 5278",
    lastSeen: "2 min ago"
  },
  {
    id: 1002,
    name: "Thomas Williams",
    contact: "555-9265",
    department: "Science",
    rfid: "8912 4867 8919",
    lastSeen: "5 min ago"
  },
  {
    id: 1003,
    name: "Nisha Mehra",
    contact: "555-9345",
    department: "English",
    rfid: "1234 6789 4567",
    lastSeen: "10 min ago"
  },
  {
    id: 1004,
    name: "Sandeep Malhotra",
    contact: "555-6789",
    department: "History",
    rfid: null,
    lastSeen: "1 min ago"
  },
  {
    id: 1005,
    name: "Anjul Verma",
    contact: "555-6976",
    department: "Economics",
    rfid: "8976 1234 5678",
    lastSeen: "15 min ago"
  }
];
