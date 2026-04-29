import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders, screen, userEvent } from '@/test/test-utils';

import LoginPage from './LoginPage';

const navigateMock = vi.fn();

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type ReactRouterDom = typeof import('react-router-dom');

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<ReactRouterDom>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('<LoginPage />', () => {
  beforeEach(() => {
    sessionStorage.clear();
    navigateMock.mockReset();
  });
  afterEach(() => {
    sessionStorage.clear();
  });

  it('renders username and password fields', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('exposes a Try Demo button that signs in and navigates to /loan', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.click(screen.getByTestId('try-demo-button'));

    expect(sessionStorage.getItem('isAuthenticated')).toBe('true');
    expect(sessionStorage.getItem('username')).toBe('demo');
    expect(navigateMock).toHaveBeenCalledWith('/loan');
  });

  it('shows an error on invalid credentials', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/username/i), 'wrong');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('flags missing fields when submitting an empty form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });
});
