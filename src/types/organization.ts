export type OrganizationStatus = "Active" | "Inactive"

export type Organization = {
  orgId: string
  orgName: string
  orgEmail: string
  orgAddress: string,
  orgPhone: string,
  partnerId: string
}

export interface OrganizationApi  {
  orgId: string
  orgName: string
  orgEmail: string
  orgPhone: string
  orgAddress: string
  password?: string
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
  password?: string

  profileImageUrl?: string;
  
  status: OrganizationStatus
  joined: string
}

