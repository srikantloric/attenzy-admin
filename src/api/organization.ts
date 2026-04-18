import type {
  CreateOrganizationResponse,
  GetOrganizationsResponse,
} from "@/types/organization"
import axiosServices from "@/utils/axios"

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL

export async function createOrganization(
  partnerId: string,
  payload: {
    orgName: string
    orgEmail: string
    orgPhone: string
    orgAddress: string
  }
): Promise<CreateOrganizationResponse> {
  const res = await fetch(
    `${BACKEND_BASE_URL}/organizations?partnerId=${partnerId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        partnerId,
      }),
    }
  )

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to create organization")
  }

  return res.json()
}


export async function getOrganizationsByPartner(
  partnerId: string
): Promise<GetOrganizationsResponse> {
  const res = await fetch(
    `${BACKEND_BASE_URL}/organizations?partnerId=${partnerId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to fetch organizations")
  }

  return res.json()
}

export async function getOrganizationById(
  orgId: string
): Promise<CreateOrganizationResponse> {
  return (await axiosServices.get("/organizations/" + orgId)).data;
}

export async function listAllOrganizations(): Promise<GetOrganizationsResponse> {
  return (await axiosServices.get("/organizations")).data;
}