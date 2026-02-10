export type StudentActiveStatus = "ACTIVE" | "INACTIVE";


export interface Student {
  studentId: string;

  studentName: string;
  studentClass: string;
  studentSection: string;
  studentPhone: string;
  rfidCode?: string;

  orgId: string;

  isActive?: boolean;

  createdAt: number;
  updatedAt: number;
}


export interface CreateStudentPayload {
  studentName: string;
  studentClass: string;
  studentSection: string;
  studentPhone: string;
  rfidCode?: string;
  orgId: string;
}


export interface UpdateStudentPayload {
  studentName?: string;
  studentClass?: string;
  studentSection?: string;
  studentPhone?: string;
  rfidCode?: string;
  status?: StudentActiveStatus;
  isActive?: boolean;
}
