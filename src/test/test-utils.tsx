import { ThemeProvider } from '@mui/material';
import { configureStore, type EnhancedStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { lightTheme } from '@/features/theme/theme';
import '@/lib/i18n';
import { api } from '@/store/api';
import loanProductReducer from '@/store/slices/loanProductSlice';
import loanReducer from '@/store/slices/loanSlice';
import memberReducer from '@/store/slices/memberSlice';
import passkeyReducer from '@/store/slices/passkeySlice';

/**
 * Build a fresh Redux store per test render so that state never leaks across tests.
 * Mirrors the production store config, but isolated.
 */
export function makeTestStore(): EnhancedStore {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      loan: loanReducer,
      member: memberReducer,
      loanProduct: loanProductReducer,
      passkey: passkeyReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(api.middleware),
  });
  setupListeners(store.dispatch);
  return store;
}

interface ProvidersProps {
  children: ReactNode;
  store: EnhancedStore;
  initialEntries?: string[] | undefined;
}

function AllProviders({ children, store, initialEntries }: ProvidersProps): ReactElement {
  return (
    <Provider store={store}>
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter initialEntries={initialEntries ?? ['/']}>{children}</MemoryRouter>
      </ThemeProvider>
    </Provider>
  );
}

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  store?: EnhancedStore;
  initialEntries?: string[];
}

export interface RenderWithProvidersResult extends ReturnType<typeof render> {
  store: EnhancedStore;
}

export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {},
): RenderWithProvidersResult {
  const { store = makeTestStore(), initialEntries, ...renderOptions } = options;
  const Wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <AllProviders store={store} initialEntries={initialEntries}>
      {children}
    </AllProviders>
  );
  const result = render(ui, { wrapper: Wrapper, ...renderOptions });
  return { ...result, store };
}

export * from '@testing-library/react';
export { userEvent };
