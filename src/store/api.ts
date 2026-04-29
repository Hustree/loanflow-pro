import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type {
  AuthSession,
  CreateLoanRequest,
  Loan,
  UpdateLoanStatusRequest,
} from '@/lib/api/types';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Loan', 'Session'],
  endpoints: (builder) => ({
    getSession: builder.query<AuthSession | null, void>({
      query: () => '/auth/session',
      providesTags: ['Session'],
    }),
    login: builder.mutation<AuthSession, { username: string; password: string }>({
      query: (creds) => ({ url: '/auth/login', method: 'POST', body: creds }),
      invalidatesTags: ['Session'],
    }),
    logout: builder.mutation<{ ok: true }, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['Session', 'Loan'],
    }),
    listLoans: builder.query<Loan[], void>({
      query: () => '/loans',
      providesTags: (result) =>
        result
          ? [
              ...result.map((l) => ({ type: 'Loan' as const, id: l.id })),
              { type: 'Loan', id: 'LIST' },
            ]
          : [{ type: 'Loan', id: 'LIST' }],
    }),
    getLoan: builder.query<Loan, string>({
      query: (id) => `/loans/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Loan', id }],
    }),
    createLoan: builder.mutation<Loan, CreateLoanRequest>({
      query: (body) => ({ url: '/loans', method: 'POST', body }),
      invalidatesTags: [{ type: 'Loan', id: 'LIST' }],
    }),
    updateLoanStatus: builder.mutation<Loan, UpdateLoanStatusRequest>({
      query: ({ loanId, ...body }) => ({
        url: `/loans/${loanId}/status`,
        method: 'PATCH',
        body: { loanId, ...body },
      }),
      invalidatesTags: (result) => (result ? [{ type: 'Loan', id: result.id }] : []),
    }),
  }),
});

export const {
  useGetSessionQuery,
  useLoginMutation,
  useLogoutMutation,
  useListLoansQuery,
  useGetLoanQuery,
  useCreateLoanMutation,
  useUpdateLoanStatusMutation,
} = api;
