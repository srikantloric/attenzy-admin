import type { GetDevicesResponse } from "@/types/device"

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL


export async function getDevicesByOrg(
  orgId: string
): Promise<GetDevicesResponse> {
  const res = await fetch(
    `${BACKEND_BASE_URL}/devices?orgId=${orgId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to fetch devices")
  }

  return res.json()
}


export async function getDevicesByOrgs(
  orgIds: string[]
) {
  const requests = orgIds.map((orgId) =>
    getDevicesByOrg(orgId)
  )

  const responses = await Promise.all(requests)

  return responses.flatMap((res) => res.items)
}
