import { LoanApplication } from '../types/loan';

export const validateLoanForm = (values: Partial<LoanApplication>): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!values.fullName?.trim()) {
    errors.fullName = 'Full name is required';
  } else if (values.fullName.trim().length < 3) {
    errors.fullName = 'Full name must be at least 3 characters';
  }

  if (!values.pnpBfpId?.trim()) {
    errors.pnpBfpId = 'PNP/BFP ID is required';
  } else if (!/^[A-Z0-9]{6,12}$/i.test(values.pnpBfpId)) {
    errors.pnpBfpId = 'Invalid ID format (6-12 alphanumeric characters)';
  }

  if (!values.loanType) {
    errors.loanType = 'Loan type is required';
  }

  if (!values.loanAmount || values.loanAmount <= 0) {
    errors.loanAmount = 'Loan amount must be greater than 0';
  } else if (values.loanAmount > 500000) {
    errors.loanAmount = 'Loan amount cannot exceed ₱500,000';
  }

  if (!values.term) {
    errors.term = 'Loan term is required';
  }

  if (!values.monthlyIncome || values.monthlyIncome <= 0) {
    errors.monthlyIncome = 'Monthly income must be greater than 0';
  } else if (values.loanAmount && values.monthlyIncome < values.loanAmount / 36) {
    errors.monthlyIncome = 'Monthly income is insufficient for the loan amount';
  }

  if (!values.disbursementMode) {
    errors.disbursementMode = 'Disbursement mode is required';
  }

  return errors;
};

export const validateLoginForm = (username: string, password: string): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!username.trim()) {
    errors.username = 'Username is required';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return errors;
};

// Additional validators for unit tests
export const validatePnpBfpId = (id: string): boolean => {
  // PNP/BFP ID should be 6-12 alphanumeric characters
  const idRegex = /^[A-Za-z0-9]{6,12}$/;
  return idRegex.test(id);
};

export const validateLoanAmount = (amount: number): boolean => {
  // Loan amount should be between 1,000 and 500,000
  return amount >= 1000 && amount <= 500000;
};

export const validateMonthlyIncome = (income: number): boolean => {
  // Monthly income should be positive
  return income > 0;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Philippine phone number format
  const phoneRegex = /^(\+63|63|0)?9\d{9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

export const validateRequiredField = (value: string): boolean => {
  return value !== null && value !== undefined && value.trim().length > 0;
};

export interface LoanEligibilityResult {
  isEligible: boolean;
  maxLoanAmount: number;
  debtToIncomeRatio: number;
  reason?: string;
  recommendation?: string;
}

export const validateLoanEligibility = (
  monthlyIncome: number,
  loanAmount: number,
  term: number
): LoanEligibilityResult => {
  const monthlyPayment = (loanAmount * 0.015 * Math.pow(1.015, term)) / (Math.pow(1.015, term) - 1);
  const debtToIncomeRatio = monthlyPayment / monthlyIncome;
  const maxLoanAmount = monthlyIncome * 10; // 10x monthly income max
  
  const isEligible = debtToIncomeRatio <= 0.4 && loanAmount <= maxLoanAmount;
  
  let reason = '';
  let recommendation = '';
  
  if (!isEligible) {
    if (debtToIncomeRatio > 0.4) {
      reason = 'Debt-to-income ratio exceeds 40%';
      recommendation = 'Consider a lower amount or longer term';
    } else if (loanAmount > maxLoanAmount) {
      reason = 'Loan amount exceeds maximum eligible amount';
      recommendation = `Maximum eligible amount: ₱${maxLoanAmount.toLocaleString()}`;
    }
  }
  
  return {
    isEligible,
    maxLoanAmount,
    debtToIncomeRatio,
    reason,
    recommendation,
  };
};