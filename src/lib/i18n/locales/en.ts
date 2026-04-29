export const en = {
  app: { name: 'LoanFlow Pro', tagline: 'Loan applications, end to end.' },
  nav: {
    apply: 'Apply for a loan',
    manage: 'Manage loans',
    dashboard: 'Dashboard',
    logout: 'Sign out',
  },
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in to continue',
    username: 'Username',
    password: 'Password',
    submit: 'Sign in',
    tryDemo: 'Try the demo (no signup)',
    demoHint: 'Demo credentials: demo / demo',
    passkey: 'Sign in with passkey',
    error: 'Invalid credentials',
    or: 'OR',
  },
  apply: {
    title: 'Apply for a loan',
    step1: 'Personal information',
    step2: 'Loan details',
    step3: 'Review & submit',
    fields: {
      fullName: 'Full name',
      pnpBfpId: 'PNP/BFP ID Number',
      pnpBfpIdHint: 'Enter your 6-12 character ID',
      monthlyIncome: 'Monthly income',
      loanType: 'Loan type',
      amount: 'Loan amount',
      amountHint: 'Maximum: ₱500,000',
      term: 'Term (months)',
      purpose: 'Purpose',
      disbursementMode: 'Disbursement mode',
      uploadHint: 'Upload supporting documents (PDF, JPG, PNG)',
    },
    submit: 'Submit loan application',
    submitting: 'Submitting...',
    success: 'Loan application submitted successfully!',
    failure: 'Failed to submit loan application.',
    referenceNumber: 'Your reference number is {{ref}}',
  },
  manage: {
    title: 'Loan management',
    new: 'New application',
    list: 'All loans',
    statusUpdate: 'Update status',
    addNote: 'Add note',
  },
} as const;

type Widen<T> = T extends string ? string : T extends object ? { [K in keyof T]: Widen<T[K]> } : T;

export type Translations = Widen<typeof en>;
