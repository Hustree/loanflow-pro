import { configureStore } from '@reduxjs/toolkit';

import loanProductReducer from './slices/loanProductSlice';
import loanReducer from './slices/loanSlice';
import memberReducer from './slices/memberSlice';
import passkeyReducer from './slices/passkeySlice';

export const store = configureStore({
  reducer: {
    loan: loanReducer,
    member: memberReducer,
    loanProduct: loanProductReducer,
    passkey: passkeyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'loan/addLoan',
          'loan/setLoans',
          'loan/updateLoanStatus',
          'member/addMember',
          'member/updateMember',
          'member/setMembers',
          'loanProduct/addProduct',
          'loanProduct/updateProduct',
          'loanProduct/setProducts',
          'passkey/register/fulfilled',
          'passkey/authenticate/fulfilled',
          'passkey/loadDevices/fulfilled',
        ],
        ignoredActionsPaths: [
          'payload.submissionDate',
          'payload.createdAt',
          'payload.updatedAt',
          'payload.dateJoined',
        ],
        ignoredPaths: ['loan.loans', 'member.members', 'loanProduct.products', 'passkey.devices'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
