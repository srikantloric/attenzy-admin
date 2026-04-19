export type UserType = "STUDENT" | "STAFF" | "FACULTY";

/* ================= BASE USER ================= */

interface BaseUser {
  userId: string;
  name: string;
  phone: string;
  email?: string | null;
  rfidCode?: string;

  externalId?: string;
  profilePhoto?: string;

  fatherName?: string;
  dob?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  bloodGroup?: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";
  address?: string;

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
  monthlyPayment: number;
  ctc: number;
}

export interface FacultyProfile {
  department: string;
  subjects: string;
  monthlyPayment: number;
  ctc: number;
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

type BaseCreatePayload = {
  name: string;
  phone: string;
  email?: string | null;
  rfidCode?: string;

  externalId?: string;
  profilePhoto?: string;

  fatherName?: string;
  dob?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  bloodGroup?: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";
  address?: string;
};

export type CreateUserPayload =
  | ({
      userType: "STUDENT";
      profile: StudentProfile;
    } & BaseCreatePayload)
  | ({
      userType: "STAFF";
      profile: StaffProfile;
    } & BaseCreatePayload)
  | ({
      userType: "FACULTY";
      profile: FacultyProfile;
    } & BaseCreatePayload);

/* ================= UPDATE USER ================= */

type BaseUpdatePayload = {
  userId: string;
  orgId: string;

  userType?: UserType;

  name?: string;
  phone?: string;
  email?: string | null;
  rfidCode?: string;

  externalId?: string;
  profilePhoto?: string;

  fatherName?: string;
  dob?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  bloodGroup?: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";
  address?: string;

  isActive?: boolean;
};

export type UpdateUserPayload =
  | (BaseUpdatePayload & {
      userType?: "STUDENT";
      profile?: Partial<StudentProfile>;
    })
  | (BaseUpdatePayload & {
      userType?: "STAFF";
      profile?: Partial<StaffProfile>;
    })
  | (BaseUpdatePayload & {
      userType?: "FACULTY";
      profile?: Partial<FacultyProfile>;
    });