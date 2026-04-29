import { describe, expect, it, vi } from 'vitest';

import type { Loan } from '@/lib/api/types';
import { renderWithProviders, screen, userEvent, waitFor } from '@/test/test-utils';

import StatusUpdateModal from './StatusUpdateModal';

const sampleLoan: Loan = {
  // Use a seeded id from src/lib/msw/db.ts so the PATCH succeeds.
  id: 'loan-002',
  referenceNumber: 'LN-20260301-0002',
  applicantId: 'demo',
  applicantName: 'Alex Demo',
  loanType: 'Salary',
  amount: 50_000,
  termMonths: 12,
  purpose: 'Test',
  status: 'pending',
  notes: [],
  submittedAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('<StatusUpdateModal />', () => {
  it('returns null when no loan is provided', () => {
    const { container } = renderWithProviders(
      <StatusUpdateModal open={true} loan={null} onClose={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders loan info, status select and notes field when open', () => {
    renderWithProviders(<StatusUpdateModal open={true} loan={sampleLoan} onClose={() => {}} />);
    expect(screen.getByText('Update Loan Status')).toBeInTheDocument();
    expect(screen.getByText('Alex Demo')).toBeInTheDocument();
    expect(screen.getByText('LN-20260301-0002')).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it('disables Update Status until notes are filled', async () => {
    renderWithProviders(<StatusUpdateModal open={true} loan={sampleLoan} onClose={() => {}} />);
    const update = screen.getByRole('button', { name: /update status/i });
    expect(update).toBeDisabled();
  });

  it('submits status change and notes via the API and closes', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<StatusUpdateModal open={true} loan={sampleLoan} onClose={onClose} />);

    // Open the status select via the combobox role
    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    await user.click(await screen.findByRole('option', { name: /approved/i }));

    await user.type(screen.getByLabelText(/notes/i), 'Approved after review');
    await user.click(screen.getByRole('button', { name: /update status/i }));

    await waitFor(
      () => {
        expect(onClose).toHaveBeenCalled();
      },
      { timeout: 4000 },
    );
  });
});
