import { Loan } from '../types/loan';
import { Timestamp } from 'firebase/firestore';

export const generateMockLoans = (count: number = 15): Loan[] => {
  const statuses = ['pending', 'approved', 'rejected', 'processing'] as const;
  const loanTypes = ['Personal', 'Emergency', 'Educational', 'Medical', 'Business'] as const;
  const names = [
    'Juan Dela Cruz',
    'Maria Santos',
    'Pedro Reyes',
    'Anna Garcia',
    'Jose Rizal',
    'Lea Salonga',
    'Manny Pacquiao',
    'Sarah Geronimo',
    'Ramon Magsaysay',
    'Corazon Aquino',
  ];

  const loans: Loan[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomType = loanTypes[Math.floor(Math.random() * loanTypes.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomAmount = Math.floor(Math.random() * 400000) + 10000;
    const randomTerm = [6, 12, 24, 36, 48][Math.floor(Math.random() * 5)];
    const randomDays = Math.floor(Math.random() * 30);
    const createdDate = new Date(now - randomDays * 24 * 60 * 60 * 1000);
    
    loans.push({
      id: `loan-${i + 1}`,
      referenceNumber: `LN-${createdDate.getFullYear()}${String(createdDate.getMonth() + 1).padStart(2, '0')}${String(createdDate.getDate()).padStart(2, '0')}-${String(i + 1).padStart(4, '0')}`,
      name: randomName,
      pnpBfpId: `PNP${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
      type: randomType,
      amount: randomAmount,
      term: randomTerm,
      monthlyIncome: Math.floor(randomAmount / 10) + 20000,
      disbursementMode: Math.random() > 0.5 ? 'bank_transfer' : 'cash_pickup',
      status: randomStatus,
      submittedAt: createdDate.toISOString(),
      notes: randomStatus === 'approved' ? 
        `Approved by Manager. Disbursement scheduled for ${new Date(now + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}.` :
        randomStatus === 'rejected' ? 
        'Insufficient income to loan ratio. Please reapply with co-maker.' :
        randomStatus === 'processing' ?
        'Documents under review. Additional requirements may be requested.' :
        'Application received and queued for review.',
      uploadedFileName: Math.random() > 0.3 ? `document_${i + 1}.pdf` : undefined,
      createdAt: Timestamp.fromDate(createdDate),
      updatedAt: Timestamp.fromDate(new Date(createdDate.getTime() + Math.random() * 24 * 60 * 60 * 1000)),
      userId: 'mock-user-001',
    });
  }

  return loans.sort((a, b) => new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime());
};

export const mockUserProfile = {
  uid: 'mock-user-001',
  email: 'juan.delacruz@psslai.com',
  displayName: 'Juan Dela Cruz',
  photoURL: null,
  memberSince: '2020-01-15',
  membershipType: 'Regular',
  department: 'PNP Region IV-A',
  position: 'Police Officer III',
  employeeId: 'PNP-2020-001234',
  mobileNumber: '+639171234567',
  address: '123 Rizal St., Quezon City, Metro Manila',
  emergencyContact: {
    name: 'Maria Dela Cruz',
    relationship: 'Spouse',
    contactNumber: '+639181234567',
  },
  creditScore: 750,
  loanLimit: 500000,
  availableCredit: 350000,
  notifications: {
    email: true,
    sms: true,
    push: true,
  },
};

export const mockDashboardMetrics = {
  totalApplications: 47,
  approvalRate: 78.5,
  averageProcessingTime: '3.2 days',
  totalDisbursed: 12500000,
  monthlyTarget: 15000000,
  targetProgress: 83.3,
  recentActivities: [
    {
      id: '1',
      type: 'approval',
      message: 'Your loan application LN-20250113-0015 has been approved',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: '2',
      type: 'disbursement',
      message: 'Funds for LN-20250113-0012 have been transferred to your account',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: '3',
      type: 'reminder',
      message: 'Payment due on January 20, 2025 for loan LN-20241215-0008',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: '4',
      type: 'document',
      message: 'Additional documents required for LN-20250113-0018',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
  ],
  upcomingPayments: [
    {
      loanRef: 'LN-20241115-0005',
      amount: 8500,
      dueDate: '2025-01-20',
      status: 'upcoming',
    },
    {
      loanRef: 'LN-20241201-0007',
      amount: 12000,
      dueDate: '2025-01-25',
      status: 'upcoming',
    },
    {
      loanRef: 'LN-20241220-0009',
      amount: 5500,
      dueDate: '2025-02-01',
      status: 'upcoming',
    },
  ],
};

export const mockLoanCalculator = (amount: number, term: number, interestRate: number = 0.015) => {
  const monthlyRate = interestRate;
  const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                        (Math.pow(1 + monthlyRate, term) - 1);
  const totalPayment = monthlyPayment * term;
  const totalInterest = totalPayment - amount;
  
  return {
    principal: amount,
    term,
    interestRate: interestRate * 100,
    monthlyPayment: Math.round(monthlyPayment),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    effectiveRate: ((totalInterest / amount) * 100).toFixed(2),
  };
};

// Mock Firebase Analytics Events
export const mockAnalyticsEvents = {
  pageView: (page: string) => {
    console.log(`[Analytics] Page View: ${page}`);
  },
  loanApplication: (amount: number, type: string) => {
    console.log(`[Analytics] Loan Application: ₱${amount} - ${type}`);
  },
  statusUpdate: (loanId: string, newStatus: string) => {
    console.log(`[Analytics] Status Update: ${loanId} -> ${newStatus}`);
  },
  userAction: (action: string, details?: any) => {
    console.log(`[Analytics] User Action: ${action}`, details);
  },
};

// Mock real-time updates simulator
export class MockRealtimeSimulator {
  private callbacks: ((loan: Loan) => void)[] = [];
  private interval: NodeJS.Timeout | null = null;

  subscribe(callback: (loan: Loan) => void) {
    this.callbacks.push(callback);
    
    if (!this.interval) {
      this.interval = setInterval(() => {
        const mockLoans = generateMockLoans(1);
        if (mockLoans[0] && Math.random() > 0.7) {
          this.callbacks.forEach(cb => cb(mockLoans[0]));
        }
      }, 10000); // Simulate update every 10 seconds
    }
    
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
      if (this.callbacks.length === 0 && this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    };
  }
}

export const mockRealtimeSimulator = new MockRealtimeSimulator();