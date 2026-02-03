export type OrganizationStatus = "Active" | "Inactive"

export interface Organization {
  id: string
  name: string
  partner: string
  status: OrganizationStatus
  devices: number
  joined: string
}
