import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

import { server } from '@/lib/msw/server';

// Polyfill crypto.randomUUID for jsdom (older versions lack it)
if (!globalThis.crypto) {
  globalThis.crypto = {} as Crypto;
}
if (!globalThis.crypto.randomUUID) {
  globalThis.crypto.randomUUID = (): `${string}-${string}-${string}-${string}-${string}` =>
    `${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 14)}` as `${string}-${string}-${string}-${string}-${string}`;
}

// Silence noisy console output that some libs (firebase auth shim, msw) generate during boot.
const originalError = console.error;
const originalWarn = console.warn;
console.error = (...args: unknown[]) => {
  const msg = String(args[0] ?? '');
  if (
    msg.includes('Firebase') ||
    msg.includes('not implemented: navigation') ||
    msg.includes('Failed to parse stored user')
  ) {
    return;
  }
  originalError(...(args as []));
};
console.warn = (...args: unknown[]) => {
  const msg = String(args[0] ?? '');
  if (msg.includes('Firebase') || msg.includes('MSW')) return;
  originalWarn(...(args as []));
};

// MSW: bypass unhandled requests (firebase auth and other side-effect libs may fetch).
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());
