# 0004 — Passkeys with static demo credentials

**Status:** Accepted
**Date:** 2026-04-29

## Context

The app demonstrates a real WebAuthn passkey flow but is also a public demo — recruiters and curious visitors should be able to try it without setting up a passkey. Mixing static credentials with a passkey ceremony is unusual; the design needs to be honest about what's real and what's simulated.

## Decision

Two parallel auth paths:

1. **Static credentials** — `demo / demo`, with a prominent "Try Demo" button that auto-fills and submits.
2. **Passkey ceremony** — a real `navigator.credentials.create()` / `.get()` call against the platform authenticator. The resulting credential is never sent off-device — registration and authentication "verifications" are simulated by MSW.

Both paths land in the same authenticated state.

## Consequences

- The demo never asks a visitor to enroll a passkey unless they choose to.
- The passkey flow exercises real browser WebAuthn API surface, so device-detection bugs (Safari Face ID, Android biometric labels) are reproducible against MSW.
- A persistent banner on passkey pages explains the simulation.
- This pattern is clearly documented and would not work as-is for production — production needs a real RP server. SECURITY.md notes this.
