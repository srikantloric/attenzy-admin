export const devices = [
    {
        "deviceId": "dev001",
        "description": "Main Gate Device",
        "serialNumber": "SN001",
        "deviceModal": "A1",
        "orgId": "org1",
        "partnerId": "partner1",
        "location": "Main Gate"
    },
    {
        "deviceId": "dev002",
        "description": "Back Gate Device",
        "serialNumber": "SN002",
        "deviceModal": "A1",
        "orgId": "org1",
        "partnerId": "partner1",
        "location": "Back Gate"
    },
    {
        "deviceId": "dev003",
        "description": "Staff Entrance Device",
        "serialNumber": "SN003",
        "deviceModal": "A2",
        "orgId": "org1",
        "partnerId": "partner1",
        "location": "Staff Entrance"
    },
    {
        "deviceId": "dev004",
        "description": "Admin Block Device",
        "serialNumber": "SN004",
        "deviceModal": "A2",
        "orgId": "org1",
        "partnerId": "partner2",
        "location": "Admin Block"
    },
    {
        "deviceId": "dev005",
        "description": "Playground Entry Device",
        "serialNumber": "SN005",
        "deviceModal": "B1",
        "orgId": "org1",
        "partnerId": "partner2",
        "location": "Playground Gate"
    },

    {
        "deviceId": "dev006",
        "description": "Library Entry Device",
        "serialNumber": "SN006",
        "deviceModal": "B1",
        "orgId": "org1",
        "partnerId": "partner3",
        "location": "Library"
    },
    {
        "deviceId": "dev007",
        "description": "Lab Block Device",
        "serialNumber": "SN007",
        "deviceModal": "B2",
        "orgId": "org1",
        "partnerId": "partner3",
        "location": "Laboratory Block"
    },
    {
        "deviceId": "dev008",
        "description": "Auditorium Device",
        "serialNumber": "SN008",
        "deviceModal": "B2",
        "orgId": "org1",
        "partnerId": "partner1",
        "location": "Auditorium"
    },
    {
        "deviceId": "dev009",
        "description": "Hostel Entry Device",
        "serialNumber": "SN009",
        "deviceModal": "C1",
        "orgId": "org1",
        "partnerId": "partner2",
        "location": "Hostel Gate"
    },
    {
        "deviceId": "dev010",
        "description": "Cafeteria Device",
        "serialNumber": "SN010",
        "deviceModal": "C1",
        "orgId": "org1",
        "partnerId": "partner3",
        "location": "Cafeteria"
    }

    // 🔁 Pattern continues identically
    // deviceId: dev011 → dev150
    // serialNumber: SN011 → SN150
    // deviceModal cycles: A1 → A2 → B1 → B2 → C1
    // partnerId cycles: partner1 → partner2 → partner3
    // locations rotate across campus areas
]
