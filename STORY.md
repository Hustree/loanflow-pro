# Origin story

## Where this came from

LoanFlow Pro started life as an internal MVP for a Philippine credit union, built around a member-facing loan application workflow. The early Day-1 deliverable focused on a multi-step loan application form, basic loan-officer management screens, and a Redux-Toolkit-driven loan workflow. Passkey-based biometric auth was added shortly after to remove the friction of passwords on member-owned devices.

That initial work shipped on Create React App, with the loan-application happy path wired against `httpbin.org` as a mock backend and a static credential pair for demos.

## What changed for the public version

For this public release, every client-specific reference was removed from runtime code. The product was renamed **LoanFlow Pro** to make it useful as a starting point for any team building a similar workflow. The original framing now lives only in this `STORY.md` and the `docs/legacy/` archive.

Other changes:

- **Vite + TypeScript strict** replaced Create React App's deprecated `react-scripts`.
- **MSW** replaced `httpbin.org` so the demo runs entirely in the browser, with a localStorage-backed fake DB seeded with three example loans.
- **RTK Query** replaced direct axios calls.
- **Feature-folder architecture** (`src/features/auth`, `src/features/loan-application`, `src/features/loan-management`) replaced the original page/components split.
- **Dark mode + i18n (en / tl / es)** were added — the Tagalog locale is a small nod to the original audience.
- **Tests, Storybook, accessibility budgets, and CI/CD** were added in line with the project's new role as a public reference.

The original credentials are gone; the demo now uses `demo / demo` plus a one-click **Try Demo** button.

## What's preserved

The passkey/WebAuthn ceremony work, the multi-step form architecture, Redux-Toolkit slice patterns, and the MUI theme structure all carry over from the original implementation. They are the parts that were portable and worth keeping; everything else was rewritten or replaced.

If you want to read the original PRDs and specs, they live unedited under `docs/legacy/`.
