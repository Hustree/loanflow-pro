# 0003 — Feature-folder structure

**Status:** Accepted
**Date:** 2026-04-29

## Context

Original layout split by technical role (`src/components/`, `src/pages/`, `src/services/`, `src/contexts/`). At ~50 files this was already showing strain — files that change together (e.g. `LoginPage`, `AuthContext`, `passkeyService`) lived in three different directories.

## Decision

Reorganise around features: `src/features/auth`, `src/features/loan-application`, `src/features/loan-management`, `src/features/theme`. Each feature owns its components, hooks, and services. Cross-feature consumption goes through the feature's barrel `index.ts`.

Truly shared primitives (TextInput, SelectInput, FileUpload, SummaryCard, ErrorBoundary, ResponsiveLayout) stay in `src/components/`. Cross-cutting infrastructure (api types, MSW handlers, Firebase adapter, i18n) lives in `src/lib/`.

## Consequences

- Files that change together live together.
- A new contributor can read one feature folder and understand a vertical slice.
- Imports across features go through barrels, which makes cross-feature coupling visible in PRs.
- Some refactor cost on day one — paid down by clearer boundaries afterwards.
