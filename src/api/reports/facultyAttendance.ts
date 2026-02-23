import type { AttendanceCalendarResponse  } from "@/types/reports/attendance"

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL

export async function getFacultyCalendarView(
  orgId: string,
  month: string
): Promise<AttendanceCalendarResponse > {
  const res = await fetch(
    `${BACKEND_BASE_URL}/orgs/${orgId}/calendar-view?month=${month}&userType=FACULTY`
  )

  if (!res.ok) {
    throw new Error("Failed to fetch faculty attendance")
  }

  return res.json()
}