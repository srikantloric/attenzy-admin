import type {
  CreateOrganizationResponse,
  GetOrganizationsResponse,
} from "@/types/organization"
import axiosServices from "@/utils/axios"

export async function createOrganization(
  partnerId: string,
  payload: {
    orgName: string
    orgEmail: string
    orgPhone: string
    orgAddress: string
  }
): Promise<CreateOrganizationResponse> {
  try {
    const res = await axiosServices.post(
      "/organizations",
      {
        ...payload,
        partnerId,
      },
      {
        params: { partnerId },
      }
    )
    return res.data
  } catch (error: any) {
    throw new Error(error?.message || "Failed to create organization")
  }
}


export async function getOrganizationsByPartner(
  partnerId: string
): Promise<GetOrganizationsResponse> {
  try {
    const res = await axiosServices.get("/organizations", {
      params: { partnerId },
    })
    return res.data
  } catch (error: any) {
    throw new Error(error?.message || "Failed to fetch organizations")
  }
}

export async function getOrganizationById(
  orgId: string
): Promise<CreateOrganizationResponse> {
  return (await axiosServices.get("/organizations/" + orgId)).data;
}

export async function listAllOrganizations(): Promise<GetOrganizationsResponse> {
  return (await axiosServices.get("/organizations")).data;
}