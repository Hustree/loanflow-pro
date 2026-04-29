export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'in-review';

export interface LoanNote {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  referenceNumber: string;
  applicantId: string;
  applicantName: string;
  loanType: string;
  amount: number;
  termMonths: number;
  purpose: string;
  status: LoanStatus;
  notes: LoanNote[];
  submittedAt: string;
  updatedAt: string;
}

export interface CreateLoanRequest {
  applicantName: string;
  loanType: string;
  amount: number;
  termMonths: number;
  purpose: string;
}

export interface UpdateLoanStatusRequest {
  loanId: string;
  status: LoanStatus;
  note?: string;
}

export interface DemoUser {
  id: string;
  username: string;
  displayName: string;
}

export interface AuthSession {
  user: DemoUser;
  token: string;
  expiresAt: string;
}
