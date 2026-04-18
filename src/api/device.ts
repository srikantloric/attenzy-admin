import axiosServices from "@/utils/axios";

export async function getDevicesByPartner(partnerId: string) {
  try {
    const { data } = await axiosServices.get("/devices", {
      params: { partnerId },
    });
    return data;
  } catch (error: any) {
    throw new Error(error?.message || "Failed to fetch devices");
  }
}

export async function getDevicesForPlarform() {
  try {
    const { data } = await axiosServices.get("/devices", {
      params: { scope: "PLATFORM_ADMIN" },
    });
    return data;
  } catch (error: any) {
    throw new Error(error?.message || "Failed to fetch devices");
  }
}

export async function addDevice(payload: {
  deviceId: string;
  serialNumber: string;
  location: string;
  description?: string;
  orgId: string;
  partnerId: string;
}): Promise<{ message: string; deviceId: string }> {
  try {
    const { data } = await axiosServices.post("/devices", payload);
    return data;
  } catch (error: any) {
    throw new Error(error?.message || "Failed to add device");
  }
}

export async function getDeviceById(deviceId: string) {
  try {
    const { data } = await axiosServices.get(`/devices/${deviceId}`);
    if (data?.message === "Device not found") return null;
    return data.item ?? data;
  } catch (error: any) {
    if (error?.status === 404) return null;
    throw new Error(error?.message || "Failed to check device");
  }
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
