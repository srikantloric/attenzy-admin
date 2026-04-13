import axiosServices from "@/utils/axios"

export type WorkingConfigPayload = {
  workingDays: number[]
  academicStartMonth: number
  academicEndMonth: number
}

export type HolidayPayload = {
  date: string
  name: string
}

type HttpError = {
  response?: {
    status?: number
  }
}

export async function getWorkingConfig(orgId: string): Promise<WorkingConfigPayload | null> {
  try {
    const res = await axiosServices.get(`/orgs/${orgId}/working-config`)
    return res.data
  } catch (error) {
    const status = (error as HttpError).response?.status
    if (status === 404) {
      return null
    }

    throw error
  }
}

export async function updateWorkingConfig(
  orgId: string,
  payload: WorkingConfigPayload
): Promise<WorkingConfigPayload> {
  const res = await axiosServices.put(`/orgs/${orgId}/working-config`, payload)
  return res.data
}

export async function listHolidays(orgId: string, month?: string): Promise<HolidayPayload[]> {
  const query = month ? `?month=${encodeURIComponent(month)}` : ""
  const res = await axiosServices.get(`/orgs/${orgId}/holidays${query}`)
  return Array.isArray(res.data) ? res.data : []
}

export async function createHoliday(orgId: string, payload: HolidayPayload): Promise<HolidayPayload> {
  const res = await axiosServices.post(`/orgs/${orgId}/holidays`, payload)
  return res.data
}