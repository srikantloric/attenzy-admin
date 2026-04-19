import type {
  PayrollEmployeeRecord,
  PayrollPolicy,
  PayrollQuery,
  PayrollReportResponse,
  PayrollSummary,
  PayrollUserType,
} from "@/types/reports/payroll"

type DummyAttendanceSeed = {
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
}

const payrollPolicy: PayrollPolicy = {
  paidLeavePerMonth: 2,
  halfDayWeight: 0.5,
  lateComePenaltyPerOccurrence: 250,
}

const dummyAttendanceSeed: DummyAttendanceSeed[] = [
  {
    userId: "FAC-001",
    name: "Arjun Mehra",
    userType: "FACULTY",
    department: "Mathematics",
    grossSalary: 68000,
    workingDays: 26,
    presentDays: 21,
    halfDays: 2,
    lateComings: 1,
    leaveDays: 2,
    absentDays: 1,
  },
  {
    userId: "FAC-002",
    name: "Nisha Rao",
    userType: "FACULTY",
    department: "Physics",
    grossSalary: 72000,
    workingDays: 26,
    presentDays: 20,
    halfDays: 3,
    lateComings: 2,
    leaveDays: 1,
    absentDays: 2,
  },
  {
    userId: "FAC-003",
    name: "Pranav Iyer",
    userType: "FACULTY",
    department: "Chemistry",
    grossSalary: 70000,
    workingDays: 26,
    presentDays: 19,
    halfDays: 2,
    lateComings: 3,
    leaveDays: 3,
    absentDays: 2,
  },
  {
    userId: "FAC-004",
    name: "Kavya Singh",
    userType: "FACULTY",
    department: "English",
    grossSalary: 65000,
    workingDays: 26,
    presentDays: 23,
    halfDays: 1,
    lateComings: 0,
    leaveDays: 1,
    absentDays: 1,
  },
  {
    userId: "STF-001",
    name: "Ramesh Patel",
    userType: "STAFF",
    department: "Administration",
    grossSalary: 42000,
    workingDays: 26,
    presentDays: 22,
    halfDays: 1,
    lateComings: 2,
    leaveDays: 2,
    absentDays: 1,
  },
  {
    userId: "STF-002",
    name: "Pooja Das",
    userType: "STAFF",
    department: "Accounts",
    grossSalary: 45000,
    workingDays: 26,
    presentDays: 20,
    halfDays: 2,
    lateComings: 1,
    leaveDays: 3,
    absentDays: 1,
  },
  {
    userId: "STF-003",
    name: "Harish Kumar",
    userType: "STAFF",
    department: "Transport",
    grossSalary: 38000,
    workingDays: 26,
    presentDays: 18,
    halfDays: 2,
    lateComings: 4,
    leaveDays: 2,
    absentDays: 4,
  },
  {
    userId: "STF-004",
    name: "Meena Joshi",
    userType: "STAFF",
    department: "Library",
    grossSalary: 40000,
    workingDays: 26,
    presentDays: 21,
    halfDays: 2,
    lateComings: 1,
    leaveDays: 1,
    absentDays: 2,
  },
]

function roundTo2(value: number): number {
  return Number(value.toFixed(2))
}

function toPayrollRecord(seed: DummyAttendanceSeed): PayrollEmployeeRecord {
  const paidLeaveUsed = Math.min(seed.leaveDays, payrollPolicy.paidLeavePerMonth)
  const unpaidLeaveDays = Math.max(seed.leaveDays - payrollPolicy.paidLeavePerMonth, 0)

  const payableDays =
    seed.presentDays +
    seed.halfDays * payrollPolicy.halfDayWeight +
    paidLeaveUsed

  const nonPayableDays = seed.workingDays - payableDays
  const perDayRate = seed.grossSalary / seed.workingDays
  const leaveDeductionAmount = roundTo2(nonPayableDays * perDayRate)
  const lateComePenaltyAmount = roundTo2(
    seed.lateComings * payrollPolicy.lateComePenaltyPerOccurrence
  )
  const deductionAmount = roundTo2(leaveDeductionAmount + lateComePenaltyAmount)
  const netPay = roundTo2(seed.grossSalary - deductionAmount)

  return {
    ...seed,
    paidLeaveUsed,
    unpaidLeaveDays,
    payableDays: roundTo2(payableDays),
    perDayRate: roundTo2(perDayRate),
    lateComePenaltyAmount,
    deductionAmount,
    netPay,
  }
}

function buildSummary(records: PayrollEmployeeRecord[]): PayrollSummary {
  return {
    employeeCount: records.length,
    grossPayout: roundTo2(records.reduce((sum, row) => sum + row.grossSalary, 0)),
    netPayout: roundTo2(records.reduce((sum, row) => sum + row.netPay, 0)),
    totalDeductions: roundTo2(
      records.reduce((sum, row) => sum + row.deductionAmount, 0)
    ),
    totalPayableDays: roundTo2(records.reduce((sum, row) => sum + row.payableDays, 0)),
  }
}

export async function getPayrollReport(
  orgId: string,
  query: PayrollQuery
): Promise<PayrollReportResponse> {
  // Dummy data implementation for UI design and flow integration.
  // Replace this with axiosServices.get(...) after backend endpoint is ready.
  const keyword = query.search?.trim().toLowerCase() ?? ""

  const filteredSeeds = dummyAttendanceSeed.filter((row) => {
    const userTypeMatch = query.userType === "ALL" || row.userType === query.userType
    const searchMatch =
      keyword.length === 0 ||
      row.name.toLowerCase().includes(keyword) ||
      row.department.toLowerCase().includes(keyword)

    return userTypeMatch && searchMatch
  })

  const records = filteredSeeds.map(toPayrollRecord)

  await new Promise((resolve) => setTimeout(resolve, 250))

  return {
    orgId,
    month: query.month,
    generatedAt: new Date().toISOString(),
    policy: payrollPolicy,
    records,
    summary: buildSummary(records),
  }
}
