import type { CreatePartnerResponse } from "@/types/partner"

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL

export async function createPartner(payload: {
    partnerName: string
    partnerEmail: string
    partnerCompany: string
    partnerPhone: string
    partnerAddress: string
}): Promise<CreatePartnerResponse> {
    const res = await fetch(`${BACKEND_BASE_URL}/partners`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to create partner")
    }

    return res.json()
}
