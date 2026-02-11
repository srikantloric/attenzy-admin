export type FacultyActiveStatus = "ACTIVE" | "INACTIVE";

export interface Faculty {
  facultyId: string;

  facultyName: string;
  facultyDepartment: string;
  facultyPhone: string;
  rfidCode?: string;

  orgId: string;

  isActive?: boolean;

  createdAt: number;
  updatedAt: number;
}

export interface CreateFacultyPayload {
  facultyName: string;
  facultyDepartment: string;
  facultyPhone: string;
  rfidCode?: string;
}

export interface UpdateFacultyPayload {
  facultyId: string;
  orgId: string;
  facultyName?: string;
  facultyDepartment?: string;
  facultyPhone?: string;
  rfidCode?: string;
  isActive?: boolean;
}
