import type { AttendanceCalendarResponse  } from "@/types/reports/attendance"
import axiosServices from "@/utils/axios"

export async function getFacultyCalendarView(
  orgId: string,
  month: string
): Promise<AttendanceCalendarResponse > {
  const res = await axiosServices.get(
    `/orgs/${orgId}/calendar-view?month=${month}&userType=FACULTY`
  )
  return res.data
}