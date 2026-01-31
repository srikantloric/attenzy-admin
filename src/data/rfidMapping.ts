export type RFIDStatus = "assigned" | "unassigned" | "invalid";

export interface RFIDMapping {
  id: number;
  name: string;
  contact: string;
  classSection: string | null;
  rfidCard: string | null;
  rfidDevice: string | null;
  lastSeen: string;
  status: RFIDStatus;
}

export const rfidMappingData: RFIDMapping[] = [
  {
    id: 1001,
    name: "Rahul Sen",
    contact: "555-1234",
    classSection: "9A",
    rfidCard: "1234 5678 1234",
    rfidDevice: "Main Gate",
    lastSeen: "Just now",
    status: "assigned"
  },
  {
    id: 1002,
    name: "Priya Kaur",
    contact: "555-5678",
    classSection: "10B",
    rfidCard: "4567 8912 4567",
    rfidDevice: "Block A",
    lastSeen: "1 min ago",
    status: "assigned"
  },
  {
    id: 1003,
    name: "Arjun Patel",
    contact: "555-9876",
    classSection: "8A",
    rfidCard: "7891 2345 6789",
    rfidDevice: "Block A",
    lastSeen: "5 min ago",
    status: "assigned"
  },
  {
    id: 1004,
    name: "Resha Das",
    contact: "555-6765",
    classSection: null,
    rfidCard: null,
    rfidDevice: null,
    lastSeen: "10 min ago",
    status: "unassigned"
  },
  {
    id: 1005,
    name: "Sameer Khan",
    contact: "555-3496",
    classSection: null,
    rfidCard: null,
    rfidDevice: "None card",
    lastSeen: "1 min ago",
    status: "invalid"
  }
];
