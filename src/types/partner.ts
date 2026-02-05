export type PartnerStatus = "Active" | "Inactive"

export interface Partner {
  partnerId: string;
  username: string;

  partnerName: string;
  partnerEmail: string;
  partnerPhone: string;
  partnerCompany?: string;
  partnerAddress?: string;

  status: PartnerStatus;
  createdAt: number;
}

