import { ThemeProvider } from '@mui/material';
import type { Preview } from '@storybook/react';

import { lightTheme } from '../src/features/theme/theme';

import '../src/lib/i18n';

const preview: Preview = {
  parameters: {
    backgrounds: { default: 'light' },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={lightTheme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;
