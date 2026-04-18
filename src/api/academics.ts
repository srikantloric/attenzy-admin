import axiosServices from "@/utils/axios"
import type {
  AcademicItem,
  CreateAcademicPayload,
  UpdateAcademicPayload
} from "@/types/academics"


/* LIST */
export async function listGrades(
  orgId: string
): Promise<AcademicItem[]> {
  const res = await axiosServices.get(`/orgs/${orgId}/grades`)
  const sortedGrades = res.data.sort((a: AcademicItem, b: AcademicItem) => {
    const createdA = a.createdAt
    const createdB = b.createdAt
    return createdA - createdB
  })
  return sortedGrades
}

/* CREATE */
export async function createGrade(
  payload: CreateAcademicPayload
): Promise<AcademicItem> {
  const res = await axiosServices.post(
    `/orgs/${payload.orgId}/grades`,
    { name: payload.name }
  )
  return res.data
}

/* UPDATE (Enable / Disable) */
export async function updateGrade(
  payload: UpdateAcademicPayload
): Promise<{ message: string }> {
  const res = await axiosServices.patch(
    `/orgs/${payload.orgId}/grades/${payload.id}`,
    { isActive: payload.isActive }
  )
  return res.data
}

/* DELETE */
export async function deleteGrade(
  orgId: string,
  id: string
): Promise<{ message: string }> {
  const res = await axiosServices.delete(
    `/orgs/${orgId}/grades/${id}`
  )
  return res.data
}


/* =====================================================
   SECTIONS
===================================================== */

export async function listSections(
  orgId: string
): Promise<AcademicItem[]> {
  const res = await axiosServices.get(`/orgs/${orgId}/sections`)
  return res.data
}

export async function createSection(
  payload: CreateAcademicPayload
): Promise<AcademicItem> {
  const res = await axiosServices.post(
    `/orgs/${payload.orgId}/sections`,
    { name: payload.name }
  )
  return res.data
}

export async function updateSection(
  payload: UpdateAcademicPayload
): Promise<{ message: string }> {
  const res = await axiosServices.patch(
    `/orgs/${payload.orgId}/sections/${payload.id}`,
    { isActive: payload.isActive }
  )
  return res.data
}

export async function deleteSection(
  orgId: string,
  id: string
): Promise<{ message: string }> {
  const res = await axiosServices.delete(
    `/orgs/${orgId}/sections/${id}`
  )
  return res.data
}



/* =====================================================
   DEPARTMENTS
===================================================== */

export async function listDepartments(
  orgId: string
): Promise<AcademicItem[]> {
  const res = await axiosServices.get(`/orgs/${orgId}/departments`)
  return res.data
}

export async function createDepartment(
  payload: CreateAcademicPayload
): Promise<AcademicItem> {
  const res = await axiosServices.post(
    `/orgs/${payload.orgId}/departments`,
    { name: payload.name }
  )
  return res.data
}

export async function updateDepartment(
  payload: UpdateAcademicPayload
): Promise<{ message: string }> {
  const res = await axiosServices.patch(
    `/orgs/${payload.orgId}/departments/${payload.id}`,
    { isActive: payload.isActive }
  )
  return res.data
}

export async function deleteDepartment(
  orgId: string,
  id: string
): Promise<{ message: string }> {
  const res = await axiosServices.delete(
    `/orgs/${orgId}/departments/${id}`
  )
  return res.data
}