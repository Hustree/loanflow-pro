import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders, screen, userEvent, waitFor } from '@/test/test-utils';

import LoanForm from './LoanForm';

describe('<LoanForm />', () => {
  it('renders all required fields and the submit button', () => {
    renderWithProviders(<LoanForm />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/PNP\/BFP ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/monthly income/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/loan amount/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit loan application/i })).toBeInTheDocument();
  });

  it('shows zod validation errors on empty submit', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoanForm />);

    await user.click(screen.getByRole('button', { name: /submit loan application/i }));

    expect(await screen.findByText(/full name is required/i)).toBeInTheDocument();
  });

  it('submits a valid loan and reports the reference number via onSuccess', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderWithProviders(<LoanForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/full name/i), 'Alex Demo');
    await user.type(screen.getByLabelText(/PNP\/BFP ID/i), 'PNP12345');
    await user.clear(screen.getByLabelText(/monthly income/i));
    await user.type(screen.getByLabelText(/monthly income/i), '25000');

    // Loan type select (MUI uses combobox role, not labelled input)
    const comboboxes = screen.getAllByRole('combobox');
    await user.click(comboboxes[0]!); // first combobox = loan type
    await user.click(await screen.findByRole('option', { name: /salary loan/i }));

    await user.clear(screen.getByLabelText(/loan amount/i));
    await user.type(screen.getByLabelText(/loan amount/i), '50000');

    // Term select — re-query because the combobox order is stable
    const comboboxesAfter = screen.getAllByRole('combobox');
    await user.click(comboboxesAfter[1]!);
    await user.click(await screen.findByRole('option', { name: /^12 months$/i }));

    // Disbursement radio
    await user.click(screen.getByRole('radio', { name: /Philippine National Bank/i }));

    await user.click(screen.getByRole('button', { name: /submit loan application/i }));

    await waitFor(
      () => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
      },
      { timeout: 4000 },
    );
    const ref = onSuccess.mock.calls[0]?.[0] as string;
    expect(ref).toMatch(/^LN-\d{8}-\d{4}$/);
    expect(await screen.findByText(/loan application submitted successfully/i)).toBeInTheDocument();
  });
});
