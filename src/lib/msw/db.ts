import type { AuthSession, DemoUser, Loan, LoanNote } from '@/lib/api/types';

const STORAGE_KEY = 'loanflow.msw.db.v1';

interface DbShape {
  loans: Loan[];
  user: DemoUser;
  session: AuthSession | null;
  passkeys: Array<{ id: string; userId: string; counter: number; transports: string[] }>;
}

const seed = (): DbShape => ({
  loans: [
    {
      id: 'loan-001',
      referenceNumber: 'LN-20260115-0001',
      applicantId: 'demo',
      applicantName: 'Alex Demo',
      loanType: 'Personal',
      amount: 50000,
      termMonths: 12,
      purpose: 'Home renovation',
      status: 'approved',
      notes: [
        {
          id: 'note-001',
          content: 'Approved after standard credit review.',
          authorId: 'admin',
          authorName: 'Loan Officer',
          createdAt: '2026-01-20T10:30:00Z',
        },
      ],
      submittedAt: '2026-01-15T09:00:00Z',
      updatedAt: '2026-01-20T10:30:00Z',
    },
    {
      id: 'loan-002',
      referenceNumber: 'LN-20260301-0002',
      applicantId: 'demo',
      applicantName: 'Alex Demo',
      loanType: 'Auto',
      amount: 250000,
      termMonths: 36,
      purpose: 'Vehicle purchase',
      status: 'pending',
      notes: [],
      submittedAt: '2026-03-01T14:15:00Z',
      updatedAt: '2026-03-01T14:15:00Z',
    },
    {
      id: 'loan-003',
      referenceNumber: 'LN-20260410-0003',
      applicantId: 'demo',
      applicantName: 'Alex Demo',
      loanType: 'Education',
      amount: 80000,
      termMonths: 24,
      purpose: 'Continuing education',
      status: 'rejected',
      notes: [
        {
          id: 'note-003',
          content: 'Insufficient income documentation.',
          authorId: 'admin',
          authorName: 'Loan Officer',
          createdAt: '2026-04-15T16:00:00Z',
        },
      ],
      submittedAt: '2026-04-10T11:00:00Z',
      updatedAt: '2026-04-15T16:00:00Z',
    },
  ],
  user: { id: 'demo', username: 'demo', displayName: 'Alex Demo' },
  session: null,
  passkeys: [],
});

const load = (): DbShape => {
  if (typeof localStorage === 'undefined') return seed();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const fresh = seed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    return JSON.parse(raw) as DbShape;
  } catch {
    const fresh = seed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }
};

const save = (db: DbShape): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
};

export const db = {
  read: load,
  write: save,
  reset: (): DbShape => {
    const fresh = seed();
    save(fresh);
    return fresh;
  },
  addNote: (loanId: string, note: Omit<LoanNote, 'id' | 'createdAt'>): Loan | null => {
    const current = load();
    const loan = current.loans.find((l) => l.id === loanId);
    if (!loan) return null;
    const fullNote: LoanNote = {
      ...note,
      id: `note-${Math.random().toString(36).slice(2, 10)}`,
      createdAt: new Date().toISOString(),
    };
    loan.notes.push(fullNote);
    loan.updatedAt = fullNote.createdAt;
    save(current);
    return loan;
  },
};
