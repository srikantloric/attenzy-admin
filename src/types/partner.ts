export type PartnerStatus = "Active" | "Inactive"

export interface Partner {
  id: string
  name: string
  status: PartnerStatus
  organizations: number
  devices: number
}
