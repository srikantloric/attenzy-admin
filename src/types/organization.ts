export type OrganizationStatus = "Active" | "Inactive"

export interface OrganizationApi  {
  orgId: string
  orgName: string
  orgEmail: string
  orgPhone: string
  orgAddress: string
  partnerId: string
  deviceCount: number

  profileImageUrl?: string;

  status: OrganizationStatus
  createdAt: number
  updatedAt: number
}

export interface CreateOrganizationResponse {
  scope: string
  item: OrganizationApi
}

export interface GetOrganizationsResponse {
  scope: string
  items: OrganizationApi []
}

/* ================= UI TYPE (TABLE / PAGE) ================= */

export interface OrganizationUI {
  id: string
  name: string
  email: string
  phone: string
  address: string
  partnerId: string
  devices: number

  profileImageUrl?: string;
  
  status: OrganizationStatus
  joined: string
}

