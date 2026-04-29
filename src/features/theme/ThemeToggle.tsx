import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { IconButton, Tooltip } from '@mui/material';

import { useThemeMode } from './useThemeMode';

export function ThemeToggle() {
  const { mode, toggle } = useThemeMode();
  const label = mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
  return (
    <Tooltip title={label}>
      <IconButton
        onClick={toggle}
        aria-label={label}
        data-testid="theme-toggle"
        color="inherit"
        size="small"
      >
        {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
