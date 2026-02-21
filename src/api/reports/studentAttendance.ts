import type { AttendanceResponse } from "@/types/attendance"

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL


export async function getAttendanceByOrg(
  orgId: string
): Promise<AttendanceResponse["items"]> {

  const res = await fetch(
    `${BACKEND_BASE_URL}/orgs/${orgId}/attscan`
  )

  if (!res.ok) {
    throw new Error("Failed to fetch attendance")
  }

  const data: AttendanceResponse = await res.json()
  return data.items
}



export async function getAttendanceByStudent(
  orgId: string,
  userId: string
): Promise<AttendanceResponse["items"]> {

  const res = await fetch(
    `${BACKEND_BASE_URL}/orgs/${orgId}/attscan?userId=${userId}`
  )

  if (!res.ok) {
    throw new Error("Failed to fetch student attendance")
  }

  const data: AttendanceResponse = await res.json()
  return data.items
}