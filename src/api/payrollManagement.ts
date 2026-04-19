import type {
  PayrollDeductionRule,
  PayrollDeductionPolicy,
  PayrollDue,
  PayrollPayeeOption,
  PayrollPaymentDetailsRecord,
  PayrollPaymentDetailsUpsertPayload,
  PayrollPaymentSetup,
  IndividualPayout,
  IndividualPayoutCreatePayload,
  IndividualPayoutUpdatePayload,
} from "@/types/payroll-management"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const paymentSetupSeed: PayrollPaymentSetup = {
  cycleType: "MONTHLY",
  payoutDay: 30,
  currency: "INR",
  payoutMode: "BANK_TRANSFER",
  approvalRequired: true,
  paidLeavePerMonth: 2,
  halfDayWeight: 0.5,
}

const deductionPolicySeed: PayrollDeductionPolicy = {
  leaveDeductionPerDay: 1,
  halfDayDeductionFraction: 0.5,
  lateComePenaltyPerOccurrence: 250,
}

const deductionPolicyByOrg: Record<string, PayrollDeductionPolicy> = {}
const deductionStoragePrefix = "payroll-deduction-policy::"

function getDeductionStorageKey(orgId: string): string {
  return `${deductionStoragePrefix}${orgId}`
}

function loadDeductionPolicy(orgId: string): PayrollDeductionPolicy {
  if (deductionPolicyByOrg[orgId]) {
    return deductionPolicyByOrg[orgId]
  }

  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(getDeductionStorageKey(orgId))
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as PayrollDeductionPolicy
        deductionPolicyByOrg[orgId] = parsed
        return parsed
      } catch {
        // fall through to seed
      }
    }
  }

  deductionPolicyByOrg[orgId] = { ...deductionPolicySeed }
  return deductionPolicyByOrg[orgId]
}

function saveDeductionPolicy(orgId: string): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(
    getDeductionStorageKey(orgId),
    JSON.stringify(deductionPolicyByOrg[orgId])
  )
}

const deductionRulesSeed: PayrollDeductionRule[] = [
  {
    id: "ded-epf",
    name: "EPF",
    type: "PERCENTAGE",
    value: 12,
    appliesTo: "ALL",
    enabled: true,
  },
  {
    id: "ded-esi",
    name: "ESI",
    type: "PERCENTAGE",
    value: 0.75,
    appliesTo: "STAFF",
    enabled: true,
  },
  {
    id: "ded-prof-tax",
    name: "Professional Tax",
    type: "FIXED",
    value: 200,
    appliesTo: "ALL",
    enabled: true,
  },
  {
    id: "ded-lop",
    name: "LOP Adjustment",
    type: "PERCENTAGE",
    value: 100,
    appliesTo: "ALL",
    enabled: true,
  },
]

const duesSeed: PayrollDue[] = [
  {
    id: "due-1",
    employeeName: "Ritika Sharma",
    userType: "FACULTY",
    month: "2026-03",
    amount: 17500,
    reason: "Arrears after appraisal revision",
    dueDate: "2026-04-30",
    status: "OPEN",
  },
  {
    id: "due-2",
    employeeName: "Aman Verma",
    userType: "STAFF",
    month: "2026-04",
    amount: 6200,
    reason: "Leave deduction dispute under review",
    dueDate: "2026-05-05",
    status: "PARTIAL",
  },
  {
    id: "due-3",
    employeeName: "Neha Sinha",
    userType: "FACULTY",
    month: "2026-02",
    amount: 0,
    reason: "Previous due settled",
    dueDate: "2026-03-10",
    status: "CLOSED",
  },
]

const payeeSeed: PayrollPayeeOption[] = [
  {
    userId: "FAC-001",
    userName: "Arjun Mehra",
    userType: "FACULTY",
    department: "Mathematics",
  },
  {
    userId: "FAC-002",
    userName: "Nisha Rao",
    userType: "FACULTY",
    department: "Physics",
  },
  {
    userId: "FAC-003",
    userName: "Pranav Iyer",
    userType: "FACULTY",
    department: "Chemistry",
  },
  {
    userId: "STF-001",
    userName: "Ramesh Patel",
    userType: "STAFF",
    department: "Administration",
  },
  {
    userId: "STF-002",
    userName: "Pooja Das",
    userType: "STAFF",
    department: "Accounts",
  },
  {
    userId: "STF-003",
    userName: "Harish Kumar",
    userType: "STAFF",
    department: "Transport",
  },
]

const paymentDetailsSeed: PayrollPaymentDetailsRecord[] = [
  {
    id: "pm-FAC-001",
    userId: "FAC-001",
    userName: "Arjun Mehra",
    userType: "FACULTY",
    department: "Mathematics",
    paymentMode: "BANK_AND_UPI",
    bankDetails: {
      accountHolderName: "Arjun Mehra",
      accountNumber: "443355667788",
      ifscCode: "HDFC0001456",
      bankName: "HDFC Bank",
      branchName: "Pune Main",
    },
    upiDetails: {
      upiId: "arjun.m@hdfcbank",
    },
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pm-STF-002",
    userId: "STF-002",
    userName: "Pooja Das",
    userType: "STAFF",
    department: "Accounts",
    paymentMode: "UPI",
    upiDetails: {
      upiId: "pooja.das@oksbi",
    },
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
]

const paymentStoreByOrg: Record<string, PayrollPaymentDetailsRecord[]> = {}
const storagePrefix = "payroll-payment-details::"

function getStorageKey(orgId: string): string {
  return `${storagePrefix}${orgId}`
}

function loadPaymentStore(orgId: string): PayrollPaymentDetailsRecord[] {
  if (paymentStoreByOrg[orgId]) {
    return paymentStoreByOrg[orgId]
  }

  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(getStorageKey(orgId))
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as PayrollPaymentDetailsRecord[]
        paymentStoreByOrg[orgId] = parsed
        return paymentStoreByOrg[orgId]
      } catch {
        // Ignore malformed local storage and fallback to seed.
      }
    }
  }

  paymentStoreByOrg[orgId] = paymentDetailsSeed.map((item) => ({ ...item }))
  return paymentStoreByOrg[orgId]
}

function savePaymentStore(orgId: string): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(getStorageKey(orgId), JSON.stringify(paymentStoreByOrg[orgId]))
}

function ensureBankDetails(payload: PayrollPaymentDetailsUpsertPayload): void {
  if (payload.paymentMode === "UPI") return

  const bank = payload.bankDetails
  if (!bank) {
    throw new Error("Bank details are required for selected payment mode")
  }

  const accountNoValid = /^\d{9,18}$/.test(bank.accountNumber)
  if (!accountNoValid) {
    throw new Error("Account number must be 9 to 18 digits")
  }

  const ifscValid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(bank.ifscCode)
  if (!ifscValid) {
    throw new Error("Invalid IFSC code format")
  }

  if (!bank.accountHolderName.trim() || !bank.bankName.trim()) {
    throw new Error("Bank account holder and bank name are required")
  }
}

function ensureUpiDetails(payload: PayrollPaymentDetailsUpsertPayload): void {
  if (payload.paymentMode === "BANK") return

  const upi = payload.upiDetails
  if (!upi || !upi.upiId.trim()) {
    throw new Error("UPI ID is required for selected payment mode")
  }

  const upiValid = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upi.upiId)
  if (!upiValid) {
    throw new Error("Invalid UPI ID format")
  }
}

export async function getPayrollPaymentSetup(
  _orgId: string
): Promise<PayrollPaymentSetup> {
  await wait(160)
  return { ...paymentSetupSeed }
}

export async function getPayrollDeductionPolicy(
  orgId: string
): Promise<PayrollDeductionPolicy> {
  await wait(140)
  return { ...loadDeductionPolicy(orgId) }
}

export async function updatePayrollDeductionPolicy(
  orgId: string,
  payload: PayrollDeductionPolicy
): Promise<PayrollDeductionPolicy> {
  await wait(180)
  deductionPolicyByOrg[orgId] = { ...payload }
  saveDeductionPolicy(orgId)
  return { ...deductionPolicyByOrg[orgId] }
}

export async function updatePayrollPaymentSetup(
  _orgId: string,
  payload: PayrollPaymentSetup
): Promise<PayrollPaymentSetup> {
  await wait(220)
  Object.assign(paymentSetupSeed, payload)
  return { ...paymentSetupSeed }
}

export async function listPayrollDeductions(
  _orgId: string
): Promise<PayrollDeductionRule[]> {
  await wait(180)
  return deductionRulesSeed.map((item) => ({ ...item }))
}

export async function listPayrollDues(_orgId: string): Promise<PayrollDue[]> {
  await wait(200)
  return duesSeed.map((item) => ({ ...item }))
}

export async function listPayrollPayees(
  _orgId: string,
  userType?: "STAFF" | "FACULTY"
): Promise<PayrollPayeeOption[]> {
  await wait(140)
  return payeeSeed
    .filter((item) => !userType || item.userType === userType)
    .map((item) => ({ ...item }))
}

export async function listPayrollPaymentDetails(
  orgId: string,
  userType?: "STAFF" | "FACULTY"
): Promise<PayrollPaymentDetailsRecord[]> {
  await wait(170)

  const store = loadPaymentStore(orgId)
  return store
    .filter((item) => !userType || item.userType === userType)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((item) => ({ ...item }))
}

export async function upsertPayrollPaymentDetails(
  orgId: string,
  payload: PayrollPaymentDetailsUpsertPayload
): Promise<PayrollPaymentDetailsRecord> {
  await wait(240)

  ensureBankDetails(payload)
  ensureUpiDetails(payload)

  const store = loadPaymentStore(orgId)
  const index = store.findIndex((item) => item.userId === payload.userId)

  const next: PayrollPaymentDetailsRecord = {
    id: index >= 0 ? store[index].id : `pm-${payload.userId}`,
    userId: payload.userId,
    userName: payload.userName,
    userType: payload.userType,
    department: payload.department,
    paymentMode: payload.paymentMode,
    bankDetails:
      payload.paymentMode === "UPI" ? undefined : payload.bankDetails,
    upiDetails:
      payload.paymentMode === "BANK" ? undefined : payload.upiDetails,
    isActive: payload.isActive ?? true,
    updatedAt: new Date().toISOString(),
  }

  if (index >= 0) {
    store[index] = next
  } else {
    store.push(next)
  }

  savePaymentStore(orgId)
  return { ...next }
}

// Individual Payouts Management
const individualPayoutsSeed: IndividualPayout[] = [
  {
    id: "ipayout-001",
    userId: "FAC-001",
    userName: "Arjun Mehra",
    userType: "FACULTY",
    department: "Mathematics",
    month: "2026-04",
    grossAmount: 65000,
    deductionAmount: 8125,
    netAmount: 56875,
    paymentMode: "BANK_AND_UPI",
    status: "PAID",
    processedAt: "2026-04-15T10:30:00.000Z",
    createdAt: "2026-04-01T08:00:00.000Z",
    updatedAt: "2026-04-15T10:30:00.000Z",
  },
  {
    id: "ipayout-002",
    userId: "STF-002",
    userName: "Pooja Das",
    userType: "STAFF",
    department: "Accounts",
    month: "2026-04",
    grossAmount: 45000,
    deductionAmount: 5625,
    netAmount: 39375,
    paymentMode: "UPI",
    status: "PROCESSING",
    processedAt: null,
    createdAt: "2026-04-05T09:15:00.000Z",
    updatedAt: "2026-04-18T14:20:00.000Z",
  },
]

const individualPayoutsStoreByOrg: Record<string, IndividualPayout[]> = {}
const individualPayoutsStoragePrefix = "payroll-individual-payouts::"

function getIndividualPayoutsStorageKey(orgId: string): string {
  return `${individualPayoutsStoragePrefix}${orgId}`
}

function loadIndividualPayoutsStore(orgId: string): IndividualPayout[] {
  if (individualPayoutsStoreByOrg[orgId]) {
    return individualPayoutsStoreByOrg[orgId]
  }

  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(getIndividualPayoutsStorageKey(orgId))
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as IndividualPayout[]
        individualPayoutsStoreByOrg[orgId] = parsed
        return individualPayoutsStoreByOrg[orgId]
      } catch {
        // fall through to seed
      }
    }
  }

  individualPayoutsStoreByOrg[orgId] = individualPayoutsSeed.map((item) => ({ ...item }))
  return individualPayoutsStoreByOrg[orgId]
}

function saveIndividualPayoutsStore(orgId: string): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(
    getIndividualPayoutsStorageKey(orgId),
    JSON.stringify(individualPayoutsStoreByOrg[orgId])
  )
}

export async function listIndividualPayouts(
  orgId: string,
  filters?: {
    month?: string
    userId?: string
    status?: any
    userType?: any
  }
): Promise<IndividualPayout[]> {
  await wait(200)

  const store = loadIndividualPayoutsStore(orgId)
  return store
    .filter((item) => {
      if (filters?.month && item.month !== filters.month) return false
      if (filters?.userId && item.userId !== filters.userId) return false
      if (filters?.status && item.status !== filters.status) return false
      if (filters?.userType && item.userType !== filters.userType) return false
      return true
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((item) => ({ ...item }))
}

export async function getIndividualPayoutById(
  orgId: string,
  payoutId: string
): Promise<IndividualPayout | null> {
  await wait(150)

  const store = loadIndividualPayoutsStore(orgId)
  return store.find((item) => item.id === payoutId) || null
}

export async function createIndividualPayout(
  orgId: string,
  payload: IndividualPayoutCreatePayload
): Promise<IndividualPayout> {
  await wait(250)

  const store = loadIndividualPayoutsStore(orgId)

  // Check for duplicate payout for same user in same month
  const existing = store.find(
    (item) => item.userId === payload.userId && item.month === payload.month
  )
  if (existing) {
    throw new Error(`Payout already exists for ${payload.userName} in ${payload.month}`)
  }

  const newPayout: IndividualPayout = {
    id: `ipayout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: payload.userId,
    userName: payload.userName,
    userType: payload.userType,
    department: payload.department,
    month: payload.month,
    grossAmount: payload.grossAmount,
    deductionAmount: payload.deductionAmount,
    netAmount: payload.netAmount,
    paymentMode: payload.paymentMode,
    status: "PENDING",
    processedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  store.push(newPayout)
  saveIndividualPayoutsStore(orgId)
  return { ...newPayout }
}

export async function updateIndividualPayoutStatus(
  orgId: string,
  payoutId: string,
  payload: IndividualPayoutUpdatePayload
): Promise<IndividualPayout> {
  await wait(200)

  const store = loadIndividualPayoutsStore(orgId)
  const index = store.findIndex((item) => item.id === payoutId)

  if (index < 0) {
    throw new Error("Payout not found")
  }

  const updated: IndividualPayout = {
    ...store[index],
    status: payload.status,
    processedAt: payload.processedAt ?? store[index].processedAt,
    updatedAt: new Date().toISOString(),
  }

  store[index] = updated
  saveIndividualPayoutsStore(orgId)
  return { ...updated }
}

export async function deleteIndividualPayout(
  orgId: string,
  payoutId: string
): Promise<void> {
  await wait(180)

  const store = loadIndividualPayoutsStore(orgId)
  const index = store.findIndex((item) => item.id === payoutId)

  if (index < 0) {
    throw new Error("Payout not found")
  }

  // Only allow deletion if status is PENDING
  if (store[index].status !== "PENDING") {
    throw new Error("Can only delete payouts with PENDING status")
  }

  store.splice(index, 1)
  saveIndividualPayoutsStore(orgId)
}

export async function getIndividualPayoutStats(
  orgId: string,
  month?: string
): Promise<{
  totalPayouts: number
  totalAmount: number
  pendingCount: number
  processingCount: number
  paidCount: number
  failedCount: number
}> {
  await wait(180)

  const store = loadIndividualPayoutsStore(orgId)
  const filtered = month ? store.filter((item) => item.month === month) : store

  return {
    totalPayouts: filtered.length,
    totalAmount: filtered.reduce((sum, item) => sum + item.netAmount, 0),
    pendingCount: filtered.filter((item) => item.status === "PENDING").length,
    processingCount: filtered.filter((item) => item.status === "PROCESSING").length,
    paidCount: filtered.filter((item) => item.status === "PAID").length,
    failedCount: filtered.filter((item) => item.status === "FAILED").length,
  }
}
