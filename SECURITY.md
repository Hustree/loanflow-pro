# Security policy

## Supported versions

Only the latest version on the `main` branch is supported. There are no LTS branches.

## Reporting a vulnerability

Please email **joshuabascos@gmail.com** with subject `SECURITY: LoanFlow Pro`.

Include:

- A description of the issue
- Steps to reproduce
- Affected versions / commits
- Optional: a suggested fix

You will receive an acknowledgement within 72 hours. We aim to triage within 7 days and ship a fix within 30 days for confirmed high-severity issues.

Please do **not** open a public GitHub issue for security reports.

## Scope

This is a portfolio + starter project. The auth surface is non-trivial (passkeys / WebAuthn) — credential ceremony bugs, session-handling issues, and supply-chain concerns are all in-scope.

## Out of scope

- Issues affecting the demo's static credentials (`demo / demo`) — these are intentional
- Issues that require a malicious browser extension or compromised host
- Self-XSS in the demo console
