export type PartnerStatus = "ACTIVE" | "INACTIVE"

export interface Partner {
  partnerId: string;
  username: string;

  partnerName: string;
  partnerEmail: string;
  partnerPhone: string;
  partnerCompany?: string;
  partnerAddress?: string;

  profileImageUrl?: string;

  orgCount: number;
  deviceCount: number;

  status: PartnerStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreatePartnerResponse {
  partnerId: string
  credentials: {
    username: string
    password: string
  }
}
