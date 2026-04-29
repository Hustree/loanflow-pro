import { createTheme, type ThemeOptions } from '@mui/material/styles';

const sharedTypography: ThemeOptions['typography'] = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  h1: { fontWeight: 800, letterSpacing: '-0.02em' },
  h2: { fontWeight: 700, letterSpacing: '-0.01em' },
  h3: { fontWeight: 700 },
  button: { textTransform: 'none', fontWeight: 600 },
};

const sharedShape: ThemeOptions['shape'] = { borderRadius: 10 };

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0F766E', dark: '#115E59', light: '#14B8A6' },
    secondary: { main: '#F59E0B', dark: '#D97706', light: '#FBBF24' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    text: { primary: '#0F172A', secondary: '#475569' },
    success: { main: '#16A34A' },
    error: { main: '#DC2626' },
    warning: { main: '#D97706' },
    info: { main: '#0EA5E9' },
  },
  typography: sharedTypography,
  shape: sharedShape,
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#14B8A6', dark: '#0F766E', light: '#5EEAD4' },
    secondary: { main: '#FBBF24', dark: '#F59E0B', light: '#FCD34D' },
    background: { default: '#0B1220', paper: '#0F172A' },
    text: { primary: '#F8FAFC', secondary: '#CBD5E1' },
    success: { main: '#22C55E' },
    error: { main: '#EF4444' },
    warning: { main: '#F59E0B' },
    info: { main: '#38BDF8' },
  },
  typography: sharedTypography,
  shape: sharedShape,
});

export const themes = { light: lightTheme, dark: darkTheme } as const;
export type ThemeMode = keyof typeof themes;
