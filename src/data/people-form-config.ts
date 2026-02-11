export const PEOPLE_FORM_CONFIG = {
  
  student: [
    { name: "name", label: "Student Name" },
    { name: "class", label: "Class" },
    { name: "section", label: "Section" },
    { name: "contactNumber", label: "Contact Number" },
    { name: "rfidCode", label: "RFID Code" },
  ],

  faculty: [
    { name: "name", label: "Faculty Name" },
    { name: "department", label: "Department" },
    { name: "contactNumber", label: "Contact Number" },
    { name: "rfidCode", label: "RFID Code" },
  ],

  staff: [
    { name: "name", label: "Staff Name" },
    { name: "designation", label: "Designation" },
    { name: "contactNumber", label: "Contact Number" },
    { name: "rfidCode", label: "RFID Code" },
  ],
} as const;
