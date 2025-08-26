import { z } from "zod"

// Define TypeScript types first, then use simple zod validations
export type LoanTypeEnum = "Emergency" | "Salary" | "Others"
export type LoanTermEnum = 12 | 24 | 36 | 48
export type DisbursementModeEnum = "PNB" | "UnionBank" | "Cebuana"
export type LoanStatusEnum = "pending" | "approved" | "rejected" | "processing" | "disbursed" | "completed"

// Simple string validation for enum-like fields
export const loanTypeEnum = z.string().refine((val): val is LoanTypeEnum => 
  ["Emergency", "Salary", "Others"].includes(val), {
  message: "Must be Emergency, Salary, or Others"
})

export const loanTermEnum = z.number().refine((val): val is LoanTermEnum => 
  [12, 24, 36, 48].includes(val), {
  message: "Term must be 12, 24, 36, or 48 months"
})

export const disbursementModeEnum = z.string().refine((val): val is DisbursementModeEnum =>
  ["PNB", "UnionBank", "Cebuana"].includes(val), {
  message: "Must be PNB, UnionBank, or Cebuana"
})

export const loanStatusEnum = z.string().refine((val): val is LoanStatusEnum =>
  ["pending", "approved", "rejected", "processing", "disbursed", "completed"].includes(val), {
  message: "Invalid loan status"
})

export const loanSchema = z.object({
  id: z.string().optional(),
  ref: z.string(),
  name: z.string().min(1, "Full name is required"),
  pnpBfpId: z.string().min(6, "PNP/BFP ID must be at least 6 characters").max(12, "PNP/BFP ID must be at most 12 characters"),
  amount: z.number().min(1, "Loan amount must be greater than 0").max(500000, "Maximum loan amount is ₱500,000"),
  type: loanTypeEnum,
  term: loanTermEnum,
  status: loanStatusEnum,
  monthlyIncome: z.number().min(1, "Monthly income is required"),
  disbursementMode: disbursementModeEnum,
  uploadedFileName: z.string().optional(),
  notes: z.string().optional(),
  submissionDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
})

export const loanApplicationInputSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  pnpBfpId: z.string().min(6, "PNP/BFP ID must be at least 6 characters").max(12, "PNP/BFP ID must be at most 12 characters"),
  amount: z.number().min(1, "Loan amount must be greater than 0").max(500000, "Maximum loan amount is ₱500,000"),
  type: loanTypeEnum,
  term: loanTermEnum,
  monthlyIncome: z.number().min(1, "Monthly income is required"),
  disbursementMode: disbursementModeEnum,
  uploadedFileName: z.string().optional(),
})

export const createLoanPayloadSchema = loanApplicationInputSchema

// Status update schema
export const statusUpdateSchema = z.object({
  id: z.string().min(1, "Loan ID is required"),
  status: loanStatusEnum,
  notes: z.string().min(1, "Notes are required for status updates").max(500, "Notes must be less than 500 characters"),
})

export const statusUpdateInputSchema = z.object({
  status: loanStatusEnum,
  notes: z.string().min(1, "Notes are required for status updates").max(500, "Notes must be less than 500 characters"),
})

// Inferred types
export type LoanSchema = z.infer<typeof loanSchema>
export type LoanApplicationInputSchema = z.infer<typeof loanApplicationInputSchema>
export type CreateLoanPayloadSchema = z.infer<typeof createLoanPayloadSchema>
export type StatusUpdateSchema = z.infer<typeof statusUpdateSchema>
export type StatusUpdateInputSchema = z.infer<typeof statusUpdateInputSchema>

// For backwards compatibility with existing types
export type Loan = LoanSchema