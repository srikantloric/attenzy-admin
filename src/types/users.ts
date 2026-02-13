export type UserType = "STUDENT" | "STAFF" | "FACULTY";

/* ================= BASE USER ================= */

interface BaseUser {
  userId: string;
  name: string;
  phone: string;
  email?: string | null;
  rfidCode?: string;
  orgId: string;
  isActive?: boolean;
  createdAt: number;
  updatedAt: number;
}

/* ================= PROFILE TYPES ================= */

export interface StudentProfile {
  class: string;
  section: string;
  rollNumber: string;
}

export interface StaffProfile {
  designation: string;
  department: string;
}

export interface FacultyProfile {
  department: string;
  subjects: string[];
}

/* ================= FULL USER (DISCRIMINATED UNION) ================= */

export interface StudentUser extends BaseUser {
  userType: "STUDENT";
  profile: StudentProfile;
}

export interface StaffUser extends BaseUser {
  userType: "STAFF";
  profile: StaffProfile;
}

export interface FacultyUser extends BaseUser {
  userType: "FACULTY";
  profile: FacultyProfile;
}

export type User =
  | StudentUser
  | StaffUser
  | FacultyUser;

/* ================= CREATE USER ================= */

export type CreateUserPayload =
  | {
    userType: "STUDENT";
    name: string;
    phone: string;
    email?: string | null;
    rfidCode?: string;
    profile: StudentProfile;
  }
  | {
    userType: "STAFF";
    name: string;
    phone: string;
    email?: string | null;
    rfidCode?: string;
    profile: StaffProfile;
  }
  | {
    userType: "FACULTY";
    name: string;
    phone: string;
    email?: string | null;
    rfidCode?: string;
    profile: FacultyProfile;
  };

/* ================= UPDATE USER ================= */

export type UpdateUserPayload =
  | {
    userId: string;
    orgId: string;
    userType?: "STUDENT";
    name?: string;
    phone?: string;
    email?: string | null;
    rfidCode?: string;
    profile?: Partial<StudentProfile>;
    isActive?: boolean;
  }
  | {
    userId: string;
    orgId: string;
    userType?: "STAFF";
    name?: string;
    phone?: string;
    email?: string | null;
    rfidCode?: string;
    profile?: Partial<StaffProfile>;
    isActive?: boolean;
  }
  | {
    userId: string;
    orgId: string;
    userType?: "FACULTY";
    name?: string;
    phone?: string;
    email?: string | null;
    rfidCode?: string;
    profile?: Partial<FacultyProfile>;
    isActive?: boolean;
  };
