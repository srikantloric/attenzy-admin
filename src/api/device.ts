import axiosServices from "@/utils/axios"

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL

export async function getDevicesByPartner(partnerId: string) {
  const res = await fetch(
    `${BACKEND_BASE_URL}/devices?partnerId=${partnerId}`
  )

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || "Failed to fetch devices")
  }

  return res.json()
}


export async function addDevice(
  payload: {
    deviceId: string
    serialNumber: string
    location: string
    description?: string
    orgId: string
    partnerId: string
  }
): Promise<{ message: string; deviceId: string }> {
  const res = await fetch(
    `${BACKEND_BASE_URL}/devices`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  )

  if (!res.ok) {
    let message = "Failed to add device"
    try {
      const error = await res.json()
      message = error.message || message
    } catch { }
    throw new Error(message)
  }

  return res.json()
}


export async function getDeviceById(deviceId: string) {
  const res = await fetch(
    `${BACKEND_BASE_URL}/devices/${deviceId}`
  )

  if (res.status === 404) return null

  const data = await res.json()

  if (data?.message === "Device not found") return null
  if (!res.ok) throw new Error(data?.message || "Failed to check device")

  return data.item ?? data
}


// For organization users to list devices under their organization
export async function listOrgDevices(orgId: string) {
  const res = axiosServices.get("/devices", {
    params: {
      orgId,
    },
  });
  return res.then((response) => response.data);
}
