export type StaffActiveStatus = "ACTIVE" | "INACTIVE";

export interface Staff {
  staffId: string;

  staffName: string;
  staffDesignation: string;
  staffPhone: string;
  rfidCode?: string;

  orgId: string;

  isActive?: boolean;

  createdAt: number;
  updatedAt: number;
}

export interface CreateStaffPayload {
  staffName: string;
  staffDesignation: string;
  staffPhone: string;
  rfidCode?: string;
}

export interface UpdateStaffPayload {
  staffId: string;
  orgId: string;
  staffName?: string;
  staffDesignation?: string;
  staffPhone?: string;
  rfidCode?: string;
  isActive?: boolean;
}
