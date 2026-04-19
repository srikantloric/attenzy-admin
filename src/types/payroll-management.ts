export type PayrollPayoutStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED"
export type PayrollRecipientType = "STAFF" | "FACULTY"
export type PayrollPaymentMode = "BANK" | "UPI" | "BANK_AND_UPI"

export interface PayrollPaymentSetup {
  cycleType: "MONTHLY" | "BIWEEKLY"
  payoutDay: number
  currency: string
  payoutMode: "BANK_TRANSFER" | "MIXED"
  approvalRequired: boolean
  paidLeavePerMonth: number
  halfDayWeight: number
}

export interface PayrollDeductionPolicy {
  leaveDeductionPerDay: number
  halfDayDeductionFraction: number
  lateComePenaltyPerOccurrence: number
}

export interface PayrollDeductionRule {
  id: string
  name: string
  type: "FIXED" | "PERCENTAGE"
  value: number
  appliesTo: "STAFF" | "FACULTY" | "ALL"
  enabled: boolean
}

export interface PayrollDue {
  id: string
  employeeName: string
  userType: PayrollRecipientType
  month: string
  amount: number
  reason: string
  dueDate: string
  status: "OPEN" | "PARTIAL" | "CLOSED"
}

export interface PayrollBankDetails {
  accountHolderName: string
  accountNumber: string
  ifscCode: string
  bankName: string
  branchName?: string
}

export interface PayrollUpiDetails {
  upiId: string
}

export interface PayrollPaymentDetailsRecord {
  id: string
  userId: string
  userName: string
  userType: PayrollRecipientType
  department: string
  paymentMode: PayrollPaymentMode
  bankDetails?: PayrollBankDetails
  upiDetails?: PayrollUpiDetails
  isActive: boolean
  updatedAt: string
}

export interface PayrollPaymentDetailsUpsertPayload {
  userId: string
  userName: string
  userType: PayrollRecipientType
  department: string
  paymentMode: PayrollPaymentMode
  bankDetails?: PayrollBankDetails
  upiDetails?: PayrollUpiDetails
  isActive?: boolean
}

export interface PayrollPayeeOption {
  userId: string
  userName: string
  userType: PayrollRecipientType
  department: string
}

export interface IndividualPayout {
  id: string
  userId: string
  userName: string
  userType: PayrollRecipientType
  department: string
  month: string
  grossAmount: number
  deductionAmount: number
  netAmount: number
  paymentMode: PayrollPaymentMode
  status: PayrollPayoutStatus
  processedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface IndividualPayoutCreatePayload {
  userId: string
  userName: string
  userType: PayrollRecipientType
  department: string
  month: string
  grossAmount: number
  deductionAmount: number
  netAmount: number
  paymentMode: PayrollPaymentMode
}

export interface IndividualPayoutUpdatePayload {
  status: PayrollPayoutStatus
  processedAt?: string | null
}
