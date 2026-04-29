# 0005 — Optional Firebase mode

**Status:** Accepted
**Date:** 2026-04-29

## Context

Firebase was a dependency in the original MVP. Removing it would lose value for self-hosters who want a real backend. Keeping it on by default would expose a Firebase project to the public demo and require maintaining spend caps.

## Decision

Make Firebase **opt-in** behind `VITE_BACKEND=firebase`. The public Vercel deploy stays in MSW mode forever; CONTRIBUTING.md documents the env vars needed to switch to Firebase locally.

## Consequences

- Public demo is free, low-risk, and works without any backend infrastructure.
- Self-hosters get a real-backend path with one env var flip.
- Both modes share the same RTK Query endpoint shapes — the adapter swap is internal.
- README must clearly state which mode is which.
