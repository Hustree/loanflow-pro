import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Member {
  id: string
  memberNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  dateJoined: Date
  status: 'active' | 'inactive' | 'suspended'
  totalLoans?: number
  currentLoanIds?: string[]
  createdAt: Date
  updatedAt?: Date
}

export interface MemberState {
  members: Member[]
  selectedMember: Member | null
  isLoading: boolean
  error: string | null
  searchQuery: string
}

const initialState: MemberState = {
  members: [],
  selectedMember: null,
  isLoading: false,
  error: null,
  searchQuery: '',
}

export const memberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {
    // CREATE
    addMember: (state, action: PayloadAction<Omit<Member, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newMember: Member = {
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      }
      state.members.push(newMember)
      state.error = null
    },

    // READ (single)
    selectMember: (state, action: PayloadAction<string>) => {
      state.selectedMember = state.members.find(member => member.id === action.payload) || null
    },

    // UPDATE
    updateMember: (state, action: PayloadAction<Partial<Member> & { id: string }>) => {
      const index = state.members.findIndex(member => member.id === action.payload.id)
      if (index !== -1) {
        state.members[index] = {
          ...state.members[index],
          ...action.payload,
          updatedAt: new Date(),
        }
        if (state.selectedMember?.id === action.payload.id) {
          state.selectedMember = state.members[index]
        }
      }
    },

    // DELETE
    deleteMember: (state, action: PayloadAction<string>) => {
      state.members = state.members.filter(member => member.id !== action.payload)
      if (state.selectedMember?.id === action.payload) {
        state.selectedMember = null
      }
      state.error = null
    },

    // BULK OPERATIONS
    setMembers: (state, action: PayloadAction<Member[]>) => {
      state.members = action.payload
      state.isLoading = false
      state.error = null
    },

    // SEARCH
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
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

    // LINK LOAN TO MEMBER
    addLoanToMember: (state, action: PayloadAction<{ memberId: string; loanId: string }>) => {
      const member = state.members.find(m => m.id === action.payload.memberId)
      if (member) {
        if (!member.currentLoanIds) {
          member.currentLoanIds = []
        }
        member.currentLoanIds.push(action.payload.loanId)
        member.totalLoans = (member.totalLoans || 0) + 1
        member.updatedAt = new Date()
      }
    },

    removeLoanFromMember: (state, action: PayloadAction<{ memberId: string; loanId: string }>) => {
      const member = state.members.find(m => m.id === action.payload.memberId)
      if (member && member.currentLoanIds) {
        member.currentLoanIds = member.currentLoanIds.filter(id => id !== action.payload.loanId)
        member.updatedAt = new Date()
      }
    },
  },
})

export const {
  addMember,
  selectMember,
  updateMember,
  deleteMember,
  setMembers,
  setSearchQuery,
  setLoading,
  setError,
  clearError,
  addLoanToMember,
  removeLoanFromMember,
} = memberSlice.actions

export default memberSlice.reducer