import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface LoanProduct {
  id: string
  code: string
  name: string
  description: string
  minAmount: number
  maxAmount: number
  interestRate: number
  processingFee: number
  availableTerms: number[]
  requirements: string[]
  isActive: boolean
  createdAt: Date
  updatedAt?: Date
}

export interface LoanProductState {
  products: LoanProduct[]
  selectedProduct: LoanProduct | null
  isLoading: boolean
  error: string | null
}

const initialState: LoanProductState = {
  products: [
    {
      id: '1',
      code: 'EMRG',
      name: 'Emergency Loan',
      description: 'Quick disbursement loan for emergency needs',
      minAmount: 5000,
      maxAmount: 50000,
      interestRate: 1.5,
      processingFee: 500,
      availableTerms: [12, 24],
      requirements: ['Valid ID', 'Proof of Income', 'Employment Certificate'],
      isActive: true,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      code: 'SAL',
      name: 'Salary Loan',
      description: 'Regular salary loan with competitive rates',
      minAmount: 10000,
      maxAmount: 500000,
      interestRate: 1.2,
      processingFee: 1000,
      availableTerms: [12, 24, 36, 48],
      requirements: ['Valid ID', 'Proof of Income', 'Employment Certificate', 'Bank Statement'],
      isActive: true,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: '3',
      code: 'OTH',
      name: 'Multi-Purpose Loan',
      description: 'Flexible loan for various purposes',
      minAmount: 5000,
      maxAmount: 200000,
      interestRate: 1.8,
      processingFee: 750,
      availableTerms: [12, 24, 36],
      requirements: ['Valid ID', 'Proof of Income', 'Collateral Documents'],
      isActive: true,
      createdAt: new Date('2024-01-01'),
    },
  ],
  selectedProduct: null,
  isLoading: false,
  error: null,
}

export const loanProductSlice = createSlice({
  name: 'loanProduct',
  initialState,
  reducers: {
    // CREATE
    addProduct: (state, action: PayloadAction<Omit<LoanProduct, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newProduct: LoanProduct = {
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      }
      state.products.push(newProduct)
      state.error = null
    },

    // READ (single)
    selectProduct: (state, action: PayloadAction<string>) => {
      state.selectedProduct = state.products.find(product => product.id === action.payload) || null
    },

    // UPDATE
    updateProduct: (state, action: PayloadAction<Partial<LoanProduct> & { id: string }>) => {
      const index = state.products.findIndex(product => product.id === action.payload.id)
      if (index !== -1) {
        state.products[index] = {
          ...state.products[index],
          ...action.payload,
          updatedAt: new Date(),
        }
        if (state.selectedProduct?.id === action.payload.id) {
          state.selectedProduct = state.products[index]
        }
      }
    },

    // DELETE
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(product => product.id !== action.payload)
      if (state.selectedProduct?.id === action.payload) {
        state.selectedProduct = null
      }
      state.error = null
    },

    // TOGGLE ACTIVE STATUS
    toggleProductStatus: (state, action: PayloadAction<string>) => {
      const product = state.products.find(p => p.id === action.payload)
      if (product) {
        product.isActive = !product.isActive
        product.updatedAt = new Date()
      }
    },

    // BULK OPERATIONS
    setProducts: (state, action: PayloadAction<LoanProduct[]>) => {
      state.products = action.payload
      state.isLoading = false
      state.error = null
    },

    // UTILITY
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
  },
})

export const {
  addProduct,
  selectProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  setProducts,
  setLoading,
  setError,
  clearError,
} = loanProductSlice.actions

export default loanProductSlice.reducer