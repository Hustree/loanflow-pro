export interface LoanApplication {
  fullName: string;
  pnpBfpId: string;
  loanType: 'Emergency' | 'Salary' | 'Others';
  loanAmount: number;
  term: 12 | 24 | 36 | 48;
  monthlyIncome: number;
  disbursementMode: 'PNB' | 'UnionBank' | 'Cebuana';
  uploadedFile?: File;
  referenceNumber?: string;
  submissionDate?: Date;
}

// Export the Loan interface from schema
export interface Loan {
  id?: string;
  ref?: string;
  referenceNumber?: string;
  name: string;
  pnpBfpId: string;
  amount: number;
  type: string;
  term: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'disbursed' | 'completed';
  monthlyIncome: number;
  disbursementMode: string;
  uploadedFileName?: string;
  notes?: string;
  submittedAt?: string;
  submissionDate?: Date;
  createdAt?: any; // Can be Date or Timestamp
  updatedAt?: any; // Can be Date or Timestamp
  userId?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  username?: string;
}

export interface FormErrors {
  [key: string]: string;
}