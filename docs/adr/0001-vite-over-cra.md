# 0001 — Vite over Create React App

**Status:** Accepted
**Date:** 2026-04-29

## Context

The repo was bootstrapped with Create React App. CRA was officially deprecated by the React team in 2025 and has not received meaningful updates. Modern toolchains (Vite, Next.js, Remix, RSBuild) all outperform CRA on dev startup, HMR speed, and bundle size.

## Decision

Migrate to **Vite 5 + SWC**. Keep the app a true SPA — Next.js / Remix would be over-rotation given there's no SSR requirement.

## Consequences

- Faster dev startup (~200ms vs CRA's ~5s on this codebase).
- `react-scripts` can be removed entirely; the build is a Vite + tsc invocation.
- Env vars move from `REACT_APP_*` to `VITE_*` and are accessed via `import.meta.env`.
- `process.env` is no longer available in browser code — Node-style polyfills are gone.
- Test runner moves from Jest (via react-scripts) to **Vitest** (shares Vite's transform pipeline; ~4× faster on this codebase).
- The CRA `eject` escape hatch is no longer needed.
