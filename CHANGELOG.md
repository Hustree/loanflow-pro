# Changelog

All notable changes to this project will be documented here. The format is [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This file is maintained automatically by [release-please](https://github.com/googleapis/release-please) — manual edits will be overwritten on the next release.

## [0.2.0](https://github.com/Hustree/loanflow-pro/compare/v0.1.0...v0.2.0) (2026-04-29)


### Features

* **auth:** add demo banner explaining simulated passkey flow ([82eb292](https://github.com/Hustree/loanflow-pro/commit/82eb29237967b0eac5eb572e0b01178398e80076))
* **auth:** add Try Demo auto-fill button to login page ([6764fbb](https://github.com/Hustree/loanflow-pro/commit/6764fbb5a6849b3888d871eee11fb79484b6f4f0))
* **i18n:** add react-i18next with en/tl/es scaffolding (login + apply localised) ([8b91cb4](https://github.com/Hustree/loanflow-pro/commit/8b91cb4be6f3080d50b3fab28d362714a4723cb6))
* **infra:** add MSW handlers + localStorage-backed seeded loan DB ([11e2e46](https://github.com/Hustree/loanflow-pro/commit/11e2e4617d0091a07d314bd3078d4cfdc065b3ab))
* **infra:** add RTK Query api slice and wire into store ([da01066](https://github.com/Hustree/loanflow-pro/commit/da01066143b469a42dd41de68d833bef1f4f5a43))
* **infra:** define API contract types for loans + auth ([4e488eb](https://github.com/Hustree/loanflow-pro/commit/4e488eb7291e219be953f384db1e007577ecd9cd))
* **infra:** gate Firebase backend behind VITE_BACKEND env flag ([18b0400](https://github.com/Hustree/loanflow-pro/commit/18b0400be8f5ca4da901af71f9a42522a3d31d6e))
* **infra:** replace direct API calls with RTK Query hooks against MSW backend ([c480fa1](https://github.com/Hustree/loanflow-pro/commit/c480fa1941565365950b03f3e49094f57a716176))
* **theme:** add dark mode toggle with localStorage + system-pref defaults ([7a2e73d](https://github.com/Hustree/loanflow-pro/commit/7a2e73d565872fe17ba400f6bb46454959613664))
* top-tier public repo upgrade ([82ddfc7](https://github.com/Hustree/loanflow-pro/commit/82ddfc71d5540e8c56a02870053eb35e3984e65c))


### Bug Fixes

* **brand:** make wordmark SVG adapt to dark/light via prefers-color-scheme ([4148aad](https://github.com/Hustree/loanflow-pro/commit/4148aad0f399355c7ed190bbc46926906a53cff3))

## [0.1.0] — initial public release

Initial top-tier public release. See [`STORY.md`](./STORY.md) for context.
