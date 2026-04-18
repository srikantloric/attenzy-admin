import type { AttendanceResponse } from "@/types/attendance";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;


export async function getAttendanceByOrg(
  orgId: string,
  classId: string,
  date: string
): Promise<AttendanceResponse["items"]> {
  const res = await fetch(
    `${BACKEND_BASE_URL}/orgs/${orgId}/attendance?date=${date}&userType=STUDENT&classId=${classId}`
  );

  if (!res.ok) throw new Error("Failed to fetch attendance");

  const data: AttendanceResponse = await res.json();
  return data.items;
}


export async function getAttendanceByStudent(
  orgId: string,
  userId: string
): Promise<AttendanceResponse["items"]> {
  const res = await fetch(
    `${BACKEND_BASE_URL}/orgs/${orgId}/attscan?userId=${userId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch student attendance");
  }

  const data: AttendanceResponse = await res.json();
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

  const res = await fetch(
    `${BACKEND_BASE_URL}/orgs/${orgId}/attscan?${params.toString()}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch attendance");
  }

  return res.json();
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

  const res = await fetch(
    `${BACKEND_BASE_URL}/orgs/${orgId}/attscan?${params.toString()}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch class attendance");
  }

  return res.json() as Promise<AttendanceResponse>;
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

  const res = await fetch(
    `${BACKEND_BASE_URL}/orgs/${orgId}/calendar-view?${params.toString()}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch calendar view");
  }

  return res.json();
}
