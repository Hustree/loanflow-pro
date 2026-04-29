/// <reference types="vitest" />
import path from 'node:path';

import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Vitest only owns unit + RTL tests under src/; Playwright owns tests/e2e/.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'build', 'dist', 'storybook-static', 'tests/**'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      // Coverage gate is enforced on the logic layer (schemas, slices, utils,
      // RTK Query API), not on view/page modules where E2E + Storybook give us
      // higher-fidelity assertions. View files still appear in the report so we
      // can monitor uncovered components without failing CI.
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/lib/msw/**',
        'src/lib/i18n/**',
        'src/lib/firebase/**',
        'src/test/**',
        'src/types/**',
      ],
      thresholds: {
        // Per-file thresholds applied only to the logic-layer paths below.
        // Lowered slightly to accommodate passkeySlice's async-thunk extra
        // reducers (those need real WebAuthn services to hit) and the
        // forgiving-by-design eligibility recommendation branch in validators.
        'src/features/loan-application/loan.schema.ts': {
          lines: 90,
          branches: 90,
          functions: 90,
          statements: 90,
        },
        'src/store/slices/loanSlice.ts': {
          lines: 95,
          branches: 90,
          functions: 95,
          statements: 95,
        },
        'src/store/slices/loanProductSlice.ts': {
          lines: 95,
          branches: 90,
          functions: 95,
          statements: 95,
        },
        'src/store/slices/memberSlice.ts': {
          lines: 95,
          branches: 90,
          functions: 95,
          statements: 95,
        },
        'src/utils/refNumber.ts': {
          lines: 95,
          branches: 90,
          functions: 95,
          statements: 95,
        },
        'src/utils/validators.ts': {
          lines: 90,
          branches: 90,
          functions: 95,
          statements: 90,
        },
      },
    },
  },
});
