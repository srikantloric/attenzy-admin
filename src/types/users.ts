export type UserType = "STUDENT" | "STAFF" | "FACULTY";

/* ================= COMMON PROFILE ================= */

export interface CommonProfile {
  fatherName?: string;
  dob?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  bloodGroup?: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";
  address?: string;
}

/* ================= BASE USER ================= */

interface BaseUser {
  userId: string;
  name: string;
  phone: string;
  email?: string | null;
  rfidCode?: string;

  externalId?: string;
  profilePhoto?: string;

  orgId: string;
  isActive?: boolean;
  createdAt: number;
  updatedAt: number;
}

/* ================= PROFILE TYPES ================= */

export interface StudentProfile extends CommonProfile {
  class: string;
  section: string;
  rollNumber: string;
}

export interface StaffProfile extends CommonProfile {
  designation: string;
  department: string;
}

export interface FacultyProfile extends CommonProfile {
  department: string;
  subjects: string;
}

export interface AssignRFIDResponse {
  message: string;
  userId: string;
  rfidCode: string;
}

/* ================= FULL USER ================= */

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

export type User = StudentUser | StaffUser | FacultyUser;

/* ================= CREATE USER ================= */

export type CreateUserPayload =
  | {
      userType: "STUDENT";
      name: string;
      phone: string;
      email?: string | null;
      rfidCode?: string;
      externalId?: string;
      profilePhoto?: string;
      profile: StudentProfile;
    }
  | {
      userType: "STAFF";
      name: string;
      phone: string;
      email?: string | null;
      rfidCode?: string;
      externalId?: string;
      profilePhoto?: string;
      profile: StaffProfile;
    }
  | {
      userType: "FACULTY";
      name: string;
      phone: string;
      email?: string | null;
      rfidCode?: string;
      externalId?: string;
      profilePhoto?: string;
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
      externalId?: string;
      profilePhoto?: string;
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
      externalId?: string;
      profilePhoto?: string;
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
      externalId?: string;
      profilePhoto?: string;
      profile?: Partial<FacultyProfile>;
      isActive?: boolean;
    };
