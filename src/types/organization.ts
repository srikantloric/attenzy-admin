export type OrganizationStatus = "Active" | "Inactive"

export interface Organization {
  username: string;
  
  orgId: string;
  orgName: string;
  orgEmail: string;
  orgPhone: string;
  orgAddress: string;

  profileImageUrl?: string;

  deviceCount: number;

  status: OrganizationStatus;
  createdAt: number;
  updatedAt: number;
}
