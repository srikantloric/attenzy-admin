import type { GetDevicesResponse, Device } from "@/types/device"

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL


export async function getDevicesByPartner(
  partnerId: string
): Promise<GetDevicesResponse> {
  const res = await fetch(
    `${BACKEND_BASE_URL}/devices?partnerId=${partnerId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )

  if (!res.ok) {
    let message = "Failed to fetch devices"
    try {
      const error = await res.json()
      message = error.message || message
    } catch {}
    throw new Error(message)
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
    } catch {}
    throw new Error(message)
  }

  return res.json()
}


export async function getDeviceById(
  deviceId: string
): Promise<Device | null> {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_BASE_URL}/devices/${deviceId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )

  if (res.status === 404) {
    return null
  }

  const data = await res.json()

  if (data?.message === "Device not found") {
    return null
  }

  if (!res.ok) {
    throw new Error(data?.message || "Failed to check device")
  }

  return data.item ?? data
}

