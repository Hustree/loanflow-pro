import type { SelectChangeEvent } from '@mui/material';
import { MenuItem, Select } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'tl', label: 'Filipino' },
  { code: 'es', label: 'Español' },
] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const onChange = (event: SelectChangeEvent): void => {
    void i18n.changeLanguage(event.target.value);
  };
  return (
    <Select
      value={i18n.resolvedLanguage ?? 'en'}
      onChange={onChange}
      size="small"
      data-testid="language-switcher"
      aria-label="Language"
      sx={{ minWidth: 110 }}
    >
      {LANGUAGES.map((l) => (
        <MenuItem key={l.code} value={l.code}>
          {l.label}
        </MenuItem>
      ))}
    </Select>
  );
}
