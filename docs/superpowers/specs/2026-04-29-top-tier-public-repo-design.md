# LoanFlow Pro — Top-Tier Public Repo Upgrade

**Status:** Approved (design phase)
**Date:** 2026-04-29
**Owner:** Joshua Bascos
**Repo:** https://github.com/Hustree/loanflow-pro

## 1. Goal

Transform `loanflow-pro` from a 4-commit Create React App scaffold into a top-tier public repo that doubles as:

1. A **portfolio showpiece** for senior reviewers (clean code, tests, branding, modern toolchain).
2. A **reusable starter** others can fork to build loan/credit-application flows.

Same end-state, both audiences served. The repo must look credible in 10 seconds (README hero), hold up under a 30-minute code review, and run a live demo within one click.

## 2. Constraints & decisions (locked during brainstorm)

| Decision          | Choice                              | Rationale                                                   |
| ----------------- | ----------------------------------- | ----------------------------------------------------------- |
| Audience          | Portfolio + OSS starter (D)         | Drives both polish and reusability                          |
| Branding identity | Dual identity (C)                   | Generic code (`LoanFlow Pro`) + honest origin in `STORY.md` |
| Scope             | Full senior-grade overhaul (C)      | Vite, tests, MSW, Storybook, a11y, i18n                     |
| Backend           | MSW default + optional Firebase (C) | Demo works zero-config; real backend opt-in                 |
| Brand assets      | Full custom (A)                     | SVG logo + wordmark + favicon + OG image                    |
| Test depth        | Critical-path coverage (B)          | Vitest unit + RTK + Playwright E2E ~70% logic, key flows    |
| Commit history    | Keep existing 4 commits (A)         | No force-push; new work as Conventional Commits             |
| Rollout           | Big-bang single PR (1)              | Full end-to-end in one shipping unit                        |
| License           | MIT                                 | Permissive, standard for portfolio + starter                |
| Attribution       | None                                | No AI/Claude/Anthropic mentions in any artifact             |

## 3. End-state architecture

### Stack

- **Build:** Vite 5 + SWC (replacing CRA / `react-scripts`)
- **Language:** TypeScript 5.x — `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, path aliases (`@/*`)
- **UI:** React 19 + MUI v7 + Emotion + custom theme with dark mode
- **State:** Redux Toolkit + RTK Query (RTK Query becomes the data layer; replaces direct axios calls)
- **Forms:** react-hook-form + Zod (kept; tighten resolvers)
- **Routing:** react-router v7 (kept) — typed routes
- **API (default):** MSW (Mock Service Worker) with seeded data persisted to localStorage
- **API (optional):** Firebase (Firestore + Auth) behind `VITE_BACKEND=firebase` env flag
- **Auth:** SimpleWebAuthn passkeys (kept) + `demo / demo` static credential with prominent "Try Demo" auto-fill
- **i18n:** react-i18next — `en` (default), `tl`, `es` scaffolded; login + apply page localised at MVP
- **Components catalog:** Storybook 8 (Vite builder)
- **A11y:** `@axe-core/react` in dev + axe budget in Playwright E2E

### Repo structure (feature-folder)

```
loanflow-pro/
├── .github/
│   ├── workflows/         # ci.yml, e2e.yml, codeql.yml, release.yml
│   ├── ISSUE_TEMPLATE/    # bug, feature, question
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── dependabot.yml
├── .vscode/               # recommended extensions, settings
├── docs/
│   ├── adr/               # 0001-vite-over-cra.md, 0002-msw-default-backend.md, ...
│   ├── screenshots/       # used by README
│   ├── architecture.md
│   └── superpowers/specs/ # this file lives here
├── public/                # favicon, logo, og-image, manifest.json, robots.txt
├── src/
│   ├── app/               # App shell, providers, router
│   ├── features/
│   │   ├── auth/          # login, passkey enrollment, "Try Demo"
│   │   ├── loan-application/  # multi-step form
│   │   ├── loan-management/   # dashboard, status updates, notes
│   │   └── theme/         # dark-mode toggle
│   ├── components/        # shared primitives (TextInput, SelectInput, FileUpload, SummaryCard)
│   ├── lib/               # api client, msw handlers, firebase adapter, i18n config
│   ├── store/             # rtk slices + rtk query api
│   ├── types/             # shared types
│   └── test/              # vitest setup, msw server, test-utils
├── tests/
│   └── e2e/               # Playwright specs
│                          # Storybook stories co-located alongside components: `Button.stories.tsx`
├── .editorconfig, .prettierrc, eslint.config.js, commitlint.config.js, .husky/, .nvmrc
├── LICENSE, README.md, STORY.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, CHANGELOG.md
├── vite.config.ts, vitest.config.ts, playwright.config.ts
└── package.json
```

## 4. Brand identity (LoanFlow Pro)

- **Name:** LoanFlow Pro
- **Tagline:** "Loan applications, end to end."
- **Wordmark:** "LoanFlow Pro" set in **Inter** (or **Space Grotesk** for character) — generated as SVG
- **Icon:** abstract upward-flow mark — stylized arrow + ledger line, two-tone (primary + accent)
- **Palette:**
  - Primary: `#0F766E` (deep teal — trust, finance)
  - Accent: `#F59E0B` (amber — action, optimism)
  - Surface (light): `#F8FAFC`
  - Surface (dark): `#0B1220`
  - Semantic (success/error/warning/info): standard MUI semantic
- **Typography:** Inter (UI), JetBrains Mono (numerics/code)
- **OG image:** 1200×630 — wordmark + icon + tagline on subtle gradient
- **Favicon:** standalone icon mark — 32, 64, 192, 512, plus maskable for PWA
- **README hero:** centered logo + tagline + 5 shield badges (CI, license, last-commit, deploy, made-with) + 3-screenshot strip + animated demo GIF

## 5. Tooling & quality gates

| Tool                | Config                                                                                                | Purpose            |
| ------------------- | ----------------------------------------------------------------------------------------------------- | ------------------ |
| ESLint              | flat config — `@typescript-eslint`, `react`, `react-hooks`, `jsx-a11y`, `import`, `unicorn`, `vitest` | static analysis    |
| Prettier            | 100-col, semi, single-quote, trailing-comma all                                                       | formatting         |
| Husky + lint-staged | pre-commit: typecheck + lint:fix + format on staged files                                             | guard rails        |
| commitlint          | Conventional Commits; scopes: `auth`, `apply`, `manage`, `theme`, `i18n`, `infra`, `docs`             | commit hygiene     |
| EditorConfig        | LF, 2-space, trim trailing whitespace                                                                 | editor parity      |
| Vitest              | jsdom, MSW server, `@testing-library/react` v16                                                       | unit + integration |
| Playwright          | Chromium + WebKit + Firefox; `@axe-core/playwright` budget                                            | E2E + a11y         |
| Storybook 8         | Vite builder; a11y addon; interactions addon                                                          | component catalog  |
| Dependabot          | weekly — npm + actions                                                                                | automated upgrades |
| CodeQL              | default JS/TS workflow                                                                                | security scanning  |
| Knip                | dead-code/dep checker (CI)                                                                            | hygiene            |
| `tsconfig`          | `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `@/*` aliases                     | type rigor         |
| Node                | pinned via `.nvmrc` (20 LTS) + `engines` field                                                        | env parity         |

## 6. CI/CD

### `.github/workflows/ci.yml` — every PR + push

1. Setup Node 20 + npm cache (or pnpm if migrated)
2. `npm ci`
3. `npm run lint`
4. `npm run typecheck`
5. `npm run test -- --coverage`
6. `npm run build`
7. Upload coverage to Codecov (badge in README)
8. `npx knip` — dead code/dep check
9. Storybook smoke build

### `.github/workflows/e2e.yml` — PRs touching `src/` + nightly cron

- Build + start preview, run Playwright on Chromium / WebKit / Firefox
- Upload trace + screenshots on failure
- axe budget gate (zero violations on key flows)

### `.github/workflows/codeql.yml` — PR + weekly cron

- Default JS/TS CodeQL workflow

### `.github/workflows/release.yml` — on tag push

- Build, generate changelog from Conventional Commits via `release-please`, attach build artifacts

### Vercel

- Project linked to repo
- Production = `main`; preview = every PR
- Auto-comment preview URL on PR
- Production env stays in MSW mode (no Firebase secrets in public deploy)

## 7. Documentation set

- **README.md** — Hero (logo, badges, tagline, demo link, screenshots, animated GIF) → Why → Quickstart → Tech stack → Features → Architecture diagram → Local dev → Testing → Deployment → Roadmap → Contributing → License. Scannable in 10s, exhaustive on read.
- **STORY.md** — Honest origin (PSSLAI MVP → generalised as LoanFlow Pro), what was learned, what changed for OSS.
- **CONTRIBUTING.md** — Dev setup, branching, Conventional Commits, PR template walkthrough, where to ask.
- **CODE_OF_CONDUCT.md** — Contributor Covenant 2.1 (verbatim).
- **SECURITY.md** — Disclosure process + supported versions (real, given the WebAuthn surface).
- **CHANGELOG.md** — auto-maintained by release-please.
- **docs/architecture.md** — System diagram + module boundaries + state flow.
- **docs/adr/** — ADRs:
  - `0001-vite-over-cra.md`
  - `0002-msw-default-backend.md`
  - `0003-feature-folder-structure.md`
  - `0004-passkeys-with-static-demo-creds.md`
  - `0005-optional-firebase-mode.md`
- **docs/screenshots/** — captured for README hero strip.

## 8. Demo UX

- **Login page:** prominent **"Try Demo"** primary button next to login form. One click → auto-fills `demo / demo` and submits. Zero friction for recruiters.
- **Passkey enrollment:** wired against MSW (simulated server). On supported devices (Touch ID / Face ID / Android biometric / Windows Hello), enroll + login flow works end-to-end. UI banner explains "simulated locally — no credentials leave your browser."
- **Mock data:** MSW seeds 3 example loans (approved, pending, rejected) on first load so the management dashboard has substance immediately. Persisted to `localStorage`.
- **Optional Firebase mode:** documented in CONTRIBUTING; flip `VITE_BACKEND=firebase` + provide config. README link to "running with a real backend."
- **Dark mode:** toggle in app bar; persisted; `prefers-color-scheme` default.
- **i18n:** language switcher in footer (en / tl / es); login + apply page localised at MVP; rest fall back to English.

## 9. Testing strategy

| Layer                   | Tool                                               | Target                                                                                                                         |
| ----------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Schemas (Zod)           | Vitest                                             | 100% — every branch                                                                                                            |
| Reducers / RTK slices   | Vitest                                             | 100%                                                                                                                           |
| Custom hooks            | Vitest + RTL                                       | every hook has ≥ 1 test                                                                                                        |
| Components — primitives | Vitest + RTL + Storybook play (co-located stories) | render + key interactions                                                                                                      |
| Components — features   | Vitest + RTL + MSW                                 | happy path + 1 error path each                                                                                                 |
| E2E                     | Playwright                                         | login (form + Try Demo + passkey), apply (multi-step + summary), manage (status update + notes), dark-mode toggle, i18n switch |
| A11y                    | axe via Playwright                                 | zero violations on login, apply, manage                                                                                        |
| Visual                  | Storybook                                          | spot-check (Chromatic optional, off in CI)                                                                                     |

CI coverage gate: **80% lines / 75% branches** on logic layer (utils, slices, schemas).

## 10. Risks & edge cases

- **Vite migration footguns:** `process.env` handling, SVG-as-component imports, Jest → Vitest config, `react-scripts` globs in tsconfig. Mitigation: clean migration via `create-vite` baseline + manual port; ADR documents changes.
- **Passkey on public demo:** MSW-simulated server makes credentials safe (none persisted server-side). UI banner makes the simulation explicit.
- **MUI v7 + React 19:** known peer-dep tension; mostly stable. Pin versions and lock.
- **Firebase secrets:** README must document spend caps, security rules, and that the public Vercel deploy stays in MSW mode.
- **License compatibility:** MIT chosen; SimpleWebAuthn (MIT), MUI (MIT) — clean.
- **Existing PRDs (`PASSKEY_*.md`, `PROJECT_SUMMARY.md`):** PSSLAI references must be scrubbed from code; original docs move to `docs/legacy/` or are summarised in STORY.md.

## 11. Acceptance criteria

- ✅ All CI checks green: lint, typecheck, test, build, e2e, codeql, knip
- ✅ Coverage badge ≥ 80%
- ✅ Lighthouse ≥ 95 on each axis (perf, a11y, best practices, SEO) for `/`, `/login`, `/loan`, `/manage`
- ✅ axe violations: 0 on login, apply, manage
- ✅ README hero renders correctly on GitHub mobile + desktop
- ✅ Live Vercel demo loads in < 2s; "Try Demo" → submit loan → see status update completes in under a minute
- ✅ Repo About: description, topics (`react`, `typescript`, `redux-toolkit`, `webauthn`, `mui`, `vite`, `loan-management`, `fintech`), website link to live demo
- ✅ All docs present (README, STORY, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, CHANGELOG, ADRs, architecture)
- ✅ All PSSLAI references removed from code; origin context kept only in `STORY.md` + ADRs
- ✅ Passkey demo works on iPhone Safari, Android Chrome, macOS Safari, Windows Hello
- ✅ All commits land as Conventional Commits with no AI attribution

## 12. Out of scope

- Real loan-officer back-office workflows (approvals, role-based access)
- Real KYC / OCR document validation
- Production-grade Firebase security rules beyond a demo template
- Mobile app (React Native)
- Internationalisation beyond en/tl/es scaffolding
- Visual regression service (Chromatic, Percy) — left optional, not gated

## 13. Open questions

None at design freeze. Implementation may surface technical questions; those will be resolved in the implementation plan.
