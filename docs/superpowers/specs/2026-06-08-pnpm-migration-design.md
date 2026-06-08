# pnpm Migration Design

**Date:** 2026-06-08
**Status:** Approved

## Overview

Migrate `yard-toolkit` monorepo from npm workspaces to pnpm workspaces. Keep Lerna for independent versioning and publishing. Modernize dep-update scripts to use pnpm idioms.

## Scope

8 packages: `eslint-config`, `postcss-config`, `prettier-config`, `stylelint-config`, `toolkit`, `ts-config`, `ts-config-wordpress`, `vite-config`. All published to GitHub Packages registry — no local consumers via `file:` or `link:`.

No GitHub Actions pipelines affected.

## Architecture

pnpm replaces npm as the workspace package manager. Lerna remains for independent versioning, changelog, and publish orchestration. pnpm and Lerna integrate natively: Lerna detects pnpm via `pnpm-workspace.yaml`.

## File Changes

### New: `pnpm-workspace.yaml`

Replaces the `workspaces` array in `package.json`:

```yaml
packages:
  - "packages/stylelint-config"
  - "packages/prettier-config"
  - "packages/eslint-config"
  - "packages/postcss-config"
  - "packages/toolkit"
  - "packages/vite-config"
  - "packages/ts-config"
  - "packages/ts-config-wordpress"
```

### New: `.npmrc`

```ini
shamefully-hoist=false
```

Explicit default. Keeps strict dep isolation — each package can only resolve what it declares. If phantom-dep breakage surfaces during `pnpm install`, add targeted `public-hoist-pattern[]=<pkg>` entries rather than enabling `shamefully-hoist`.

### `package.json` (root)

- Remove `workspaces` array
- Add `"packageManager": "pnpm@<latest-stable>"` (pinned via corepack)
- Remove `npm-check-updates` from `devDependencies`
- Update scripts:
  - `dep:outdated`: `npm outdated --workspaces` → `pnpm outdated --recursive`
  - `dep:update`: `ncu --deep -u && npm install` → `pnpm up --recursive --latest`

### `lerna.json`

Add `"npmClient": "pnpm"` — explicit, even though Lerna auto-detects via `pnpm-workspace.yaml`.

### Deleted: `package-lock.json`

Replaced by `pnpm-lock.yaml` (generated on first `pnpm install`).

## Tools Unaffected

- **syncpack** — reads `package.json` files directly; pnpm-agnostic, no config change needed
- **husky** — runs via `prepare` script; pnpm runs lifecycle scripts normally
- **lint-staged** — invoked by husky; no package manager dependency

## Error Handling

If `pnpm install` fails due to phantom deps (packages importing undeclared hoisted deps), fix by declaring the missing dep in the relevant `packages/*/package.json` rather than loosening `.npmrc`. This is the correct fix and improves correctness.

## Verification

After migration:
1. `pnpm install` completes without errors
2. `pnpm outdated --recursive` runs and reports correctly
3. `pnpm up --recursive --latest` runs without errors
4. `pnpm --filter @yardinternet/toolkit <script>` executes correctly
5. `lerna version` dry-run completes without errors
6. `syncpack list-mismatches` still works
