import type { AttendanceResponse } from "@/types/attendance"
import type { AttendanceStatus } from "@/types/attendance"
import type { AttendanceCalendarResponse } from "@/types/reports/attendance"

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export async function getAttendanceByOrg(orgId: string) {
  const res = await fetch(`${BACKEND_BASE_URL}/orgs/${orgId}/attscan`)

  if (!res.ok) {
    throw new Error("Failed to fetch attendance")
  }

  const data: AttendanceResponse = await res.json()
  return data.items
}

export interface ManualAttendanceUpdateItem {
  userId: string
  status: AttendanceStatus
  reason?: string
}

export interface ManualAttendanceUpdateRequest {
  date: string
  updates: ManualAttendanceUpdateItem[]
}

export interface ManualAttendanceUpdateResult {
  userId: string
  success: boolean
  reason?: string
  message?: string
  error?: string
}

export interface ManualAttendanceUpdateResponse {
  success?: number
  failed?: number
  results?: ManualAttendanceUpdateResult[]
}

export async function updateManualAttendance(
  orgId: string,
  payload: ManualAttendanceUpdateRequest
): Promise<ManualAttendanceUpdateResponse> {
  if (payload.updates.length > 200) {
    throw new Error("Max updates per request is 200")
  }

  const res = await fetch(`${BACKEND_BASE_URL}/orgs/${orgId}/attendance/manual`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || "Failed to update manual attendance")
  }

  return res.json()
}

export async function getAttendanceCalendarView(
  orgId: string,
  month: string
): Promise<AttendanceCalendarResponse> {
  const query = new URLSearchParams({ month })
  const res = await fetch(`${BACKEND_BASE_URL}/orgs/${orgId}/calendar-view?${query.toString()}`)

  if (!res.ok) {
    throw new Error("Failed to fetch attendance calendar view")
  }

  return res.json()
}
