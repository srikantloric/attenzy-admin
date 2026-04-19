export type PayrollUserType = "STAFF" | "FACULTY"

export interface PayrollQuery {
  month: string
  userType: PayrollUserType | "ALL"
  search?: string
}

export interface PayrollPolicy {
  paidLeavePerMonth: number
  halfDayWeight: number
  lateComePenaltyPerOccurrence: number
}

export interface PayrollEmployeeRecord {
  userId: string
  name: string
  userType: PayrollUserType
  department: string
  grossSalary: number
  workingDays: number
  presentDays: number
  halfDays: number
  lateComings: number
  leaveDays: number
  absentDays: number
  paidLeaveUsed: number
  unpaidLeaveDays: number
  payableDays: number
  perDayRate: number
  lateComePenaltyAmount: number
  deductionAmount: number
  netPay: number
}

export interface PayrollSummary {
  employeeCount: number
  grossPayout: number
  netPayout: number
  totalDeductions: number
  totalPayableDays: number
}

export interface PayrollReportResponse {
  orgId: string
  month: string
  generatedAt: string
  policy: PayrollPolicy
  records: PayrollEmployeeRecord[]
  summary: PayrollSummary
}
