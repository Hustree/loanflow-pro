# Contributing to LoanFlow Pro

Thanks for taking interest. This is a small project — contributions of any size are welcome.

## Development setup

Prerequisites: Node 20+ (use `nvm use` to pick up `.nvmrc`).

```bash
git clone https://github.com/Hustree/loanflow-pro.git
cd loanflow-pro
npm install
npm run dev
```

The app runs at http://localhost:3000. By default it uses MSW as a mocked backend; nothing else is required.

## Running with a real Firebase backend (optional)

```bash
cp .env.example .env.local
# Fill in VITE_FIREBASE_* variables
echo "VITE_BACKEND=firebase" >> .env.local
npm run dev
```

The public Vercel deploy stays in MSW mode regardless — Firebase mode is for local development and self-hosters.

## Scripts

| Script                    | Purpose                        |
| ------------------------- | ------------------------------ |
| `npm run dev`             | Vite dev server                |
| `npm run build`           | Production build               |
| `npm run preview`         | Serve production build locally |
| `npm run test`            | Vitest unit/integration tests  |
| `npm run test:cov`        | Vitest with coverage           |
| `npm run test:e2e`        | Playwright E2E                 |
| `npm run storybook`       | Storybook dev                  |
| `npm run build-storybook` | Storybook production build     |
| `npm run lint`            | ESLint                         |
| `npm run lint:fix`        | ESLint with auto-fix           |
| `npm run format`          | Prettier write                 |
| `npm run typecheck`       | tsc --noEmit                   |

## Branching + commits

- Branch from `main`: `feat/...`, `fix/...`, `chore/...`, `docs/...`.
- Use [Conventional Commits](https://www.conventionalcommits.org/) — commitlint is enforced via Husky.
- Allowed scopes: `auth`, `apply`, `manage`, `theme`, `i18n`, `infra`, `docs`, `brand`, `test`, `ci`, `deps`, `release`.
- Pre-commit hooks run lint-staged (eslint --fix + prettier).

## Pull requests

The PR template lists what reviewers will check. In short:

- Type-check, lint, tests, and build must pass.
- New behaviour needs tests (unit, integration, or E2E — pick what fits).
- UI changes need a screenshot or GIF.
- Storybook stories for new shared components.

## Architecture overview

See [`docs/architecture.md`](./docs/architecture.md) and the ADRs under [`docs/adr/`](./docs/adr/).

## Questions

Open a question issue or email the maintainer (see `SECURITY.md` for security-only contact).
