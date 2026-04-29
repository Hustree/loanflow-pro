import { describe, expect, it } from 'vitest';

import type { Loan } from '@/features/loan-application/loan.schema';

import loanReducer, {
  addLoan,
  clearError,
  removeLoan,
  setError,
  setLoading,
  setLoans,
  updateLoanStatus,
  type LoanState,
} from './loanSlice';

const initial: LoanState = {
  loans: [],
  isLoading: false,
  error: null,
};

const samplePayload = {
  name: 'Alex Demo',
  pnpBfpId: 'PNP12345',
  amount: 50_000,
  type: 'Salary' as const,
  term: 12 as const,
  monthlyIncome: 25_000,
  disbursementMode: 'PNB' as const,
};

describe('loanSlice', () => {
  it('returns initial state for an unknown action', () => {
    expect(loanReducer(undefined, { type: '@@INIT' })).toEqual(initial);
  });

  it('addLoan appends a loan with generated id, ref, status=pending', () => {
    const next = loanReducer(initial, addLoan(samplePayload));
    expect(next.loans).toHaveLength(1);
    const loan = next.loans[0]!;
    expect(loan.name).toBe('Alex Demo');
    expect(loan.status).toBe('pending');
    expect(loan.id).toBeTruthy();
    expect(loan.ref).toMatch(/^LN-\d{8}-\d{4}$/);
    expect(loan.submissionDate).toBeInstanceOf(Date);
    expect(loan.createdAt).toBeInstanceOf(Date);
    expect(next.error).toBeNull();
  });

  it('addLoan resets error', () => {
    const next = loanReducer({ ...initial, error: 'oops' }, addLoan(samplePayload));
    expect(next.error).toBeNull();
  });

  it('updateLoanStatus updates matching loan', () => {
    const seeded: LoanState = {
      ...initial,
      loans: [
        {
          id: 'loan-1',
          ref: 'LN-1',
          name: 'A',
          pnpBfpId: 'PNP12345',
          amount: 1,
          type: 'Salary',
          term: 12,
          status: 'pending',
          monthlyIncome: 1,
          disbursementMode: 'PNB',
          submissionDate: new Date(),
          createdAt: new Date(),
        } as Loan,
      ],
    };
    const next = loanReducer(
      seeded,
      updateLoanStatus({ id: 'loan-1', status: 'approved', notes: 'ok' }),
    );
    expect(next.loans[0]!.status).toBe('approved');
    expect(next.loans[0]!.notes).toBe('ok');
    expect(next.loans[0]!.updatedAt).toBeInstanceOf(Date);
  });

  it('updateLoanStatus is a no-op when id not found', () => {
    const next = loanReducer(
      initial,
      updateLoanStatus({ id: 'missing', status: 'approved', notes: 'ok' }),
    );
    expect(next.loans).toHaveLength(0);
  });

  it('removeLoan filters by id', () => {
    const seeded: LoanState = {
      ...initial,
      loans: [{ id: 'a' } as Loan, { id: 'b' } as Loan],
    };
    const next = loanReducer(seeded, removeLoan('a'));
    expect(next.loans).toHaveLength(1);
    expect(next.loans[0]!.id).toBe('b');
    expect(next.error).toBeNull();
  });

  it('setLoading toggles isLoading', () => {
    expect(loanReducer(initial, setLoading(true)).isLoading).toBe(true);
    expect(loanReducer({ ...initial, isLoading: true }, setLoading(false)).isLoading).toBe(false);
  });

  it('setError sets error and turns off loading', () => {
    const next = loanReducer({ ...initial, isLoading: true }, setError('boom'));
    expect(next.error).toBe('boom');
    expect(next.isLoading).toBe(false);
  });

  it('clearError clears the error', () => {
    expect(loanReducer({ ...initial, error: 'x' }, clearError()).error).toBeNull();
  });

  it('setLoans replaces the loans array and clears error/loading', () => {
    const loans = [{ id: 'a' } as Loan];
    const next = loanReducer({ ...initial, isLoading: true, error: 'e' }, setLoans(loans));
    expect(next.loans).toEqual(loans);
    expect(next.isLoading).toBe(false);
    expect(next.error).toBeNull();
  });
});
