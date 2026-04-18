import type { CreatePartnerResponse } from "@/types/partner"
import axiosServices from "@/utils/axios"

export async function createPartner(payload: {
    partnerName: string
    partnerEmail: string
    partnerCompany: string
    partnerPhone: string
    partnerAddress: string
}): Promise<CreatePartnerResponse> {
    try {
        const res = await axiosServices.post("/partners", payload)
        return res.data
    } catch (error: any) {
        throw new Error(error?.message || "Failed to create partner")
    }
}
