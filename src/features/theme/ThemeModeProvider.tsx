import { ThemeProvider, useMediaQuery } from '@mui/material';
import type { ReactNode } from 'react';
import { createContext, useEffect, useMemo, useState } from 'react';

import { themes, type ThemeMode } from './theme';

const STORAGE_KEY = 'loanflow.themeMode';

interface ThemeModeContextValue {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

interface ThemeModeProviderProps {
  children: ReactNode;
}

export function ThemeModeProvider({ children }: ThemeModeProviderProps) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored === 'light' || stored === 'dark') return stored;
    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }, [mode]);

  const value = useMemo<ThemeModeContextValue>(
    () => ({
      mode,
      toggle: () => setModeState((m) => (m === 'light' ? 'dark' : 'light')),
      setMode: setModeState,
    }),
    [mode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={themes[mode]}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
