import type { AttendanceResponse } from "@/types/attendance";
import axiosServices from "@/utils/axios";


export async function getAttendanceByOrg(
  orgId: string,
  classId: string,
  date: string
): Promise<AttendanceResponse["items"]> {
  const { data } = await axiosServices.get<AttendanceResponse>(
    `/orgs/${orgId}/attendance?date=${date}&userType=STUDENT&classId=${classId}`
  );
  return data.items;
}


export async function getAttendanceByStudent(
  orgId: string,
  userId: string
): Promise<AttendanceResponse["items"]> {
  const { data } = await axiosServices.get<AttendanceResponse>(
    `/orgs/${orgId}/attscan?userId=${userId}`
  );
  return data.items;
}

export async function getAttendanceByDateRange(
  orgId: string,
  startDate: string,
  endDate: string
) {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });

  const res = await axiosServices.get(`/orgs/${orgId}/attscan?${params.toString()}`);
  return res.data;
}

export async function getClassAttendance(
  orgId: string,
  classId: string,
  date: string
) {
  const params = new URLSearchParams({
    classId,
    date,
  });

  const res = await axiosServices.get<AttendanceResponse>(
    `/orgs/${orgId}/attscan?${params.toString()}`
  );
  return res.data;
}

export async function getCalendarView(
  orgId: string,
  month: string,
  classId: string
) {
  const params = new URLSearchParams({
    month,
    classId,
  });

  const res = await axiosServices.get(
    `/orgs/${orgId}/calendar-view?${params.toString()}`
  );
  return res.data;
}
