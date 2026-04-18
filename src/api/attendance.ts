import type { AttendanceResponse } from "@/types/attendance";
import type { AttendanceStatus } from "@/types/attendance";
import type { AttendanceCalendarResponse } from "@/types/reports/attendance";
import axiosServices from "@/utils/axios";


export async function getAttendanceByOrg(orgId: string, date?: string) {
  const params = new URLSearchParams();

  if (date) {
    params.set("date", date);
  }

  const query = params.toString();
  const { data } = await axiosServices.get<AttendanceResponse>(
    `/orgs/${orgId}/attscan${query ? `?${query}` : ""}`
  );
  return data.items;
}

/* =========================
   MANUAL ATTENDANCE TYPES
========================= */

export interface ManualAttendanceUpdateItem {
  userId: string;
  status: AttendanceStatus;
  reason?: string;
}

export interface ManualAttendanceUpdateRequest {
  date: string;
  updates: ManualAttendanceUpdateItem[];
}

export interface ManualAttendanceUpdateResult {
  userId: string;
  status: AttendanceStatus;
  ok: boolean;
  message?: string;
}

export interface ManualAttendanceUpdateResponse {
  orgId: string;
  date: string;
  total: number;

  successCount: number;
  failedCount: number;

  results: ManualAttendanceUpdateResult[];
}

/* =========================
   UPDATE MANUAL ATTENDANCE
========================= */

export async function updateManualAttendance(
  orgId: string,
  payload: ManualAttendanceUpdateRequest
): Promise<ManualAttendanceUpdateResponse> {
  if (payload.updates.length > 200) {
    throw new Error("Max updates per request is 200");
  }

  try {
    const { data } = await axiosServices.patch<ManualAttendanceUpdateResponse>(
      `/orgs/${orgId}/attendance/manual`,
      payload
    );
    return data;
  } catch (error: any) {
    throw new Error(error?.message || "Failed to update manual attendance");
  }
}

/* =========================
   CALENDAR VIEW
========================= */

export async function getAttendanceCalendarView(
  orgId: string,
  month: string
): Promise<AttendanceCalendarResponse> {
  const query = new URLSearchParams({ month });
  const { data } = await axiosServices.get<AttendanceCalendarResponse>(
    `/orgs/${orgId}/calendar-view?${query.toString()}`
  );
  return data;
}

/* =========================
   HELPER: COUNT SUCCESS/FAIL
========================= */

export const getCountsFromResponse = (
  response: ManualAttendanceUpdateResponse
) => {
  return {
    success: response.successCount,
    failed: response.failedCount,
  };
};
