import { describe, expect, it } from 'vitest';

import {
  createLoanPayloadSchema,
  disbursementModeEnum,
  loanApplicationInputSchema,
  loanSchema,
  loanStatusEnum,
  loanTermEnum,
  loanTypeEnum,
  statusUpdateInputSchema,
  statusUpdateSchema,
} from './loan.schema';

const validInput = {
  name: 'Alex Demo',
  pnpBfpId: 'PNP12345',
  amount: 50_000,
  type: 'Salary',
  term: 12,
  monthlyIncome: 25_000,
  disbursementMode: 'PNB',
};

describe('loanApplicationInputSchema', () => {
  it('accepts a valid application payload', () => {
    const result = loanApplicationInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = loanApplicationInputSchema.safeParse({ ...validInput, name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'name')).toBe(true);
    }
  });

  it('rejects pnpBfpId shorter than 6 characters', () => {
    const result = loanApplicationInputSchema.safeParse({ ...validInput, pnpBfpId: '12345' });
    expect(result.success).toBe(false);
  });

  it('rejects pnpBfpId longer than 12 characters', () => {
    const result = loanApplicationInputSchema.safeParse({
      ...validInput,
      pnpBfpId: '1234567890123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-positive amount', () => {
    const result = loanApplicationInputSchema.safeParse({ ...validInput, amount: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects amount above 500,000', () => {
    const result = loanApplicationInputSchema.safeParse({ ...validInput, amount: 500_001 });
    expect(result.success).toBe(false);
  });

  it('rejects unsupported loan type strings', () => {
    const result = loanApplicationInputSchema.safeParse({ ...validInput, type: 'PaydayAdvance' });
    expect(result.success).toBe(false);
  });

  it('rejects unsupported term values', () => {
    const result = loanApplicationInputSchema.safeParse({ ...validInput, term: 18 });
    expect(result.success).toBe(false);
  });

  it('rejects unsupported disbursement modes', () => {
    const result = loanApplicationInputSchema.safeParse({
      ...validInput,
      disbursementMode: 'GCash',
    });
    expect(result.success).toBe(false);
  });

  it('rejects monthly income of 0', () => {
    const result = loanApplicationInputSchema.safeParse({ ...validInput, monthlyIncome: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects wrong types (string amount)', () => {
    const result = loanApplicationInputSchema.safeParse({ ...validInput, amount: '50000' });
    expect(result.success).toBe(false);
  });

  it('exposes createLoanPayloadSchema as the same shape', () => {
    expect(createLoanPayloadSchema.safeParse(validInput).success).toBe(true);
  });
});

describe('loanSchema (full record)', () => {
  it('accepts a fully populated record', () => {
    const now = new Date();
    const result = loanSchema.safeParse({
      id: 'loan-1',
      ref: 'LN-20260101-1234',
      name: 'Alex Demo',
      pnpBfpId: 'PNP12345',
      amount: 50_000,
      type: 'Salary',
      term: 12,
      status: 'pending',
      monthlyIncome: 25_000,
      disbursementMode: 'PNB',
      submissionDate: now,
      createdAt: now,
    });
    expect(result.success).toBe(true);
  });

  it('rejects an unknown status', () => {
    const result = loanSchema.safeParse({
      ref: 'LN-1',
      name: 'A',
      pnpBfpId: 'PNP12345',
      amount: 100,
      type: 'Salary',
      term: 12,
      status: 'archived',
      monthlyIncome: 1,
      disbursementMode: 'PNB',
      submissionDate: new Date(),
      createdAt: new Date(),
    });
    expect(result.success).toBe(false);
  });
});

describe('statusUpdateSchema / statusUpdateInputSchema', () => {
  it('accepts a valid status update with notes', () => {
    const result = statusUpdateSchema.safeParse({
      id: 'loan-1',
      status: 'approved',
      notes: 'Approved after review',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty notes', () => {
    const result = statusUpdateSchema.safeParse({
      id: 'loan-1',
      status: 'approved',
      notes: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects notes longer than 500 chars', () => {
    const result = statusUpdateSchema.safeParse({
      id: 'loan-1',
      status: 'approved',
      notes: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty loan id', () => {
    const result = statusUpdateSchema.safeParse({
      id: '',
      status: 'approved',
      notes: 'ok',
    });
    expect(result.success).toBe(false);
  });

  it('input variant omits id but still validates notes', () => {
    expect(statusUpdateInputSchema.safeParse({ status: 'approved', notes: 'ok' }).success).toBe(
      true,
    );
    expect(statusUpdateInputSchema.safeParse({ status: 'approved', notes: '' }).success).toBe(
      false,
    );
  });
});

describe('enum validators (direct)', () => {
  it.each(['Emergency', 'Salary', 'Others'])('loanTypeEnum accepts %s', (val) => {
    expect(loanTypeEnum.safeParse(val).success).toBe(true);
  });
  it('loanTypeEnum rejects invalid', () => {
    expect(loanTypeEnum.safeParse('Auto').success).toBe(false);
  });

  it.each([12, 24, 36, 48])('loanTermEnum accepts %s', (val) => {
    expect(loanTermEnum.safeParse(val).success).toBe(true);
  });
  it('loanTermEnum rejects invalid', () => {
    expect(loanTermEnum.safeParse(6).success).toBe(false);
  });

  it.each(['PNB', 'UnionBank', 'Cebuana'])('disbursementModeEnum accepts %s', (val) => {
    expect(disbursementModeEnum.safeParse(val).success).toBe(true);
  });
  it('disbursementModeEnum rejects invalid', () => {
    expect(disbursementModeEnum.safeParse('BPI').success).toBe(false);
  });

  it.each(['pending', 'approved', 'rejected', 'processing', 'disbursed', 'completed'])(
    'loanStatusEnum accepts %s',
    (val) => {
      expect(loanStatusEnum.safeParse(val).success).toBe(true);
    },
  );
  it('loanStatusEnum rejects invalid', () => {
    expect(loanStatusEnum.safeParse('archived').success).toBe(false);
  });
});
