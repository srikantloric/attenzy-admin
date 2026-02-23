import type { StaffCalendarResponse } from "@/types/reports/staffAttendance"

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL

export async function getStaffCalendarView(
  orgId: string,
  month: string
): Promise<StaffCalendarResponse> {
  const res = await fetch(
    `${BACKEND_BASE_URL}/orgs/${orgId}/calendar-view?month=${month}&userType=STAFF`
  )

  if (!res.ok) {
    throw new Error("Failed to fetch staff attendance")
  }

  return res.json()
}