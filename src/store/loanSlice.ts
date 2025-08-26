import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Loan, CreateLoanPayloadSchema } from '../schema/loan'
import { generateReferenceNumber } from '../utils/refNumber'

export interface LoanState {
  loans: Loan[]
  isLoading: boolean
  error: string | null
}

const initialState: LoanState = {
  loans: [],
  isLoading: false,
  error: null,
}

export const loanSlice = createSlice({
  name: 'loan',
  initialState,
  reducers: {
    addLoan: (state, action: PayloadAction<CreateLoanPayloadSchema>) => {
      const newLoan: Loan = {
        ...action.payload,
        id: crypto.randomUUID(),
        ref: generateReferenceNumber(),
        status: 'pending',
        submissionDate: new Date(),
        createdAt: new Date(),
      }
      state.loans.push(newLoan)
      state.error = null
    },
    
    updateLoanStatus: (state, action: PayloadAction<{ id: string; status: Loan['status']; notes: string }>) => {
      const loan = state.loans.find(loan => loan.id === action.payload.id)
      if (loan) {
        loan.status = action.payload.status
        loan.notes = action.payload.notes
        loan.updatedAt = new Date()
      }
    },
    
    removeLoan: (state, action: PayloadAction<string>) => {
      state.loans = state.loans.filter(loan => loan.id !== action.payload)
      state.error = null
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    // For future API integration
    setLoans: (state, action: PayloadAction<Loan[]>) => {
      state.loans = action.payload
      state.isLoading = false
      state.error = null
    },
  },
})

export const { 
  addLoan, 
  updateLoanStatus, 
  removeLoan, 
  setLoading, 
  setError, 
  clearError,
  setLoans 
} = loanSlice.actions

export default loanSlice.reducer