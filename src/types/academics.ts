export interface AcademicItem {
  gradeId?: string
  sectionId?: string
  departmentId?: string
  name: string
  isActive: boolean
  createdAt: number
}

/* CREATE PAYLOAD */
export interface CreateAcademicPayload {
  orgId: string
  name: string
}

/* UPDATE PAYLOAD */
export interface UpdateAcademicPayload {
  orgId: string
  id: string
  isActive: boolean
}