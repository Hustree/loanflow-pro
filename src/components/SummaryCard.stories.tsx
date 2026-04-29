import type { Meta, StoryObj } from '@storybook/react';

import type { LoanApplication } from '@/types/loan';

import SummaryCard from './SummaryCard';

const baseLoan: LoanApplication = {
  fullName: 'Alex Demo',
  pnpBfpId: 'PNP-2024-0001',
  loanType: 'Salary',
  loanAmount: 150000,
  term: 24,
  monthlyIncome: 45000,
  disbursementMode: 'UnionBank',
  referenceNumber: 'LF-2026-000123',
  submissionDate: new Date('2026-04-15T09:30:00'),
};

const meta: Meta<typeof SummaryCard> = {
  title: 'Components/SummaryCard',
  component: SummaryCard,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof SummaryCard>;

export const Default: Story = {
  args: { loanData: baseLoan },
};

export const Emergency: Story = {
  args: {
    loanData: {
      ...baseLoan,
      loanType: 'Emergency',
      loanAmount: 50000,
      term: 12,
      referenceNumber: 'LF-2026-000200',
    },
  },
};

export const LongTerm: Story = {
  args: {
    loanData: {
      ...baseLoan,
      loanType: 'Others',
      loanAmount: 500000,
      term: 48,
      monthlyIncome: 80000,
      disbursementMode: 'PNB',
      referenceNumber: 'LF-2026-000301',
    },
  },
};

export const WithUploadedFile: Story = {
  args: {
    loanData: {
      ...baseLoan,
      uploadedFile: new File(['demo'], 'payslip-april.pdf', { type: 'application/pdf' }),
    },
  },
};

export const PendingSubmission: Story = {
  args: {
    loanData: {
      fullName: 'Pat Sample',
      pnpBfpId: 'BFP-2024-0099',
      loanType: 'Salary',
      loanAmount: 75000,
      term: 12,
      monthlyIncome: 30000,
      disbursementMode: 'Cebuana',
      referenceNumber: 'LF-2026-000999',
    },
  },
};
