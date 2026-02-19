import type { AttendanceResponse } from "@/types/attendance"

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export async function getAttendanceByOrg(orgId: string) {
  const res = await fetch(`${BACKEND_BASE_URL}/orgs/${orgId}/attscan`)

  if (!res.ok) {
    throw new Error("Failed to fetch attendance")
  }

  const data: AttendanceResponse = await res.json()
  return data.items
}
