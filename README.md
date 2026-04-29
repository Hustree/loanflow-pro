<div align="center">
  <img src="./public/logo-wordmark.svg" alt="LoanFlow Pro" width="320" />
  <p><strong>Loan applications, end to end.</strong></p>

  <p>
    <a href="https://github.com/Hustree/loanflow-pro/actions/workflows/ci.yml"><img src="https://github.com/Hustree/loanflow-pro/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
    <a href="https://codecov.io/gh/Hustree/loanflow-pro"><img src="https://codecov.io/gh/Hustree/loanflow-pro/branch/main/graph/badge.svg" alt="Coverage" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/github/license/Hustree/loanflow-pro" alt="License" /></a>
    <img src="https://img.shields.io/github/last-commit/Hustree/loanflow-pro" alt="Last commit" />
    <img src="https://img.shields.io/badge/built%20with-React%2019%20%2B%20Vite-0F766E" alt="Stack" />
  </p>

  <p>
    <a href="https://loanflow-pro.vercel.app"><strong>Live demo &rarr;</strong></a>
    &nbsp;&middot;&nbsp;
    <a href="./STORY.md">Story</a>
    &nbsp;&middot;&nbsp;
    <a href="./docs/architecture.md">Architecture</a>
    &nbsp;&middot;&nbsp;
    <a href="./CONTRIBUTING.md">Contributing</a>
  </p>
</div>

## Why this exists

LoanFlow Pro is a production-shaped reference for the slice of fintech most teams end up building: a member submits a loan application, an officer reviews and updates status, both sides need clear feedback. It's also a working portfolio piece — every part of it is exercised by tests, axe budgets, and a live demo.

It started as an internal MVP for a credit union. The full origin story is in [`STORY.md`](./STORY.md).

## Headline strengths

What makes this repo worth your time:

1. **Real WebAuthn passkey POC.** Not a stub — the registration and authentication ceremonies call `navigator.credentials.create()` / `.get()` against the platform authenticator (Touch ID, Face ID, Windows Hello, Android biometric). Device detection picks the right label per platform (e.g. "Sign in with Face ID" on iPhone, "Use fingerprint" on Android). The relying-party verification is simulated by MSW so the demo runs without a server, but the browser side is the real ceremony — same code you'd ship to production with a real RP attached. Implementation lives in `src/features/auth/`; design is captured in [ADR 0004](./docs/adr/0004-passkeys-with-static-demo-creds.md) and the original PRDs under `docs/legacy/`.
2. **Zero-config public demo via MSW.** The Vercel deploy needs no backend, no secrets, no spend caps. A localStorage-backed in-memory DB seeded with three example loans makes the management dashboard immediately useful — recruiters don't land on an empty list. The same handlers run in Vitest via `setupServer`, so unit tests share the contract.
3. **TypeScript strict + feature-folder architecture.** `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are on. Code is organised by feature (`auth`, `loan-application`, `loan-management`, `theme`), each with a public-API barrel — cross-feature coupling is visible at the import level.
4. **Tests that actually cover behaviour.** 125 Vitest specs (95–100% coverage on schemas, slices, validators, refNumber utility), 30 Playwright E2E specs across Chromium / WebKit / Firefox, axe accessibility budgets enforced per route. CI gates the whole stack.

## Try it in 5 seconds

1. Open the [live demo](https://loanflow-pro.vercel.app).
2. Click **Try the demo (no signup)**.
3. Submit a loan, update its status, toggle dark mode, switch language.
4. (On a passkey-capable device) sign out and try **Sign in with passkey** to enroll your platform authenticator.

No signup, no API keys, no backend required.

## What's inside

| Area             | Tech                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| **Build**        | Vite 5 + SWC, TypeScript 5 (strict + noUncheckedIndexedAccess)                                                 |
| **UI**           | React 19, MUI v7, Emotion, dark mode, react-i18next (en / tl / es)                                             |
| **State + data** | Redux Toolkit + RTK Query, react-hook-form, Zod                                                                |
| **Backend**      | MSW (default, in-browser) or Firebase (opt-in)                                                                 |
| **Auth**         | SimpleWebAuthn passkeys + static demo credentials                                                              |
| **Tests**        | Vitest, Testing Library, MSW (Node), Playwright (Chromium / WebKit / Firefox), axe                             |
| **Components**   | Storybook 8 + a11y addon                                                                                       |
| **CI/CD**        | GitHub Actions (lint / typecheck / test / build / e2e / CodeQL / knip), Vercel preview deploys, release-please |

## Features

- **Passkey authentication** (real WebAuthn ceremony) with device-specific UX — Touch ID, Face ID, Windows Hello, Android biometric. Falls back to static demo credentials so the demo always works.
- **Multi-step loan application** with Zod-validated form, file upload, and generated reference numbers (`LN-YYYYMMDD-NNNN`).
- **Loan management dashboard** with status updates, expandable detail rows, and a notes/audit trail.
- **MSW-backed demo** with three seeded loans persisted to `localStorage` — same handlers reused in unit tests.
- **Dark mode** with system-pref defaults and persistence.
- **i18n** scaffolded for English, Filipino, and Spanish.
- **Accessibility budget** — zero axe violations on key flows in CI.

## Local development

```bash
git clone https://github.com/Hustree/loanflow-pro.git
cd loanflow-pro
nvm use            # picks up .nvmrc -> Node 20
npm install
npm run dev
```

Visit http://localhost:3000.

### Scripts

```bash
npm run dev              # Vite dev server
npm run build            # Production build
npm run preview          # Serve the production build
npm run test             # Vitest unit + integration
npm run test:cov         # ... with coverage
npm run test:e2e         # Playwright across Chromium / WebKit / Firefox
npm run storybook        # Storybook dev
npm run lint             # ESLint
npm run typecheck        # tsc --noEmit
```

### Run with a real Firebase backend (optional)

```bash
cp .env.example .env.local
# Fill in VITE_FIREBASE_* values
echo "VITE_BACKEND=firebase" >> .env.local
npm run dev
```

The default MSW mode requires no configuration.

## Architecture

See [`docs/architecture.md`](./docs/architecture.md) for the full picture. Key decisions are recorded as ADRs:

- [0001 — Vite over CRA](./docs/adr/0001-vite-over-cra.md)
- [0002 — MSW as the default backend](./docs/adr/0002-msw-default-backend.md)
- [0003 — Feature-folder structure](./docs/adr/0003-feature-folder-structure.md)
- [0004 — Passkeys with static demo credentials](./docs/adr/0004-passkeys-with-static-demo-creds.md)
- [0005 — Optional Firebase mode](./docs/adr/0005-optional-firebase-mode.md)

## Testing

| Layer                                | Tool                           | Where                    |
| ------------------------------------ | ------------------------------ | ------------------------ |
| Schemas, reducers, hooks, primitives | Vitest + Testing Library       | `src/**/*.test.{ts,tsx}` |
| Feature integration (with MSW)       | Vitest + Testing Library + MSW | colocated `*.test.tsx`   |
| End-to-end                           | Playwright (3 browsers)        | `tests/e2e/*.spec.ts`    |
| Accessibility                        | axe-core via Playwright        | per-page budget in E2E   |
| Components                           | Storybook + a11y addon         | `*.stories.tsx`          |

CI gates: `lint`, `typecheck`, `test:cov` (logic-layer files at 95-100%), `build`, `build-storybook`, `knip`, Playwright on PRs that touch `src/`.

## Deployment

The repo is wired to Vercel — every PR gets a preview URL, and `main` deploys to production. The production deploy stays in MSW mode (no Firebase secrets), so the demo is always free to run.

To self-deploy:

```bash
npm i -g vercel
vercel link
vercel --prod
```

## Roadmap

- [ ] Real RP server reference implementation for passkey ceremony
- [ ] Loan-officer multi-user workflow (roles, approvals, audit log)
- [ ] OCR / KYC document validation
- [ ] PWA install + offline support

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) and the [code of conduct](./CODE_OF_CONDUCT.md). For security issues, see [`SECURITY.md`](./SECURITY.md).

## License

[MIT](./LICENSE) &copy; Joshua Bascos
