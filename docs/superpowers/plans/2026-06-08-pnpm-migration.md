# pnpm Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate yard-toolkit from npm workspaces to pnpm workspaces, keeping Lerna for publishing, and modernise dep-update scripts.

**Architecture:** Replace `package.json` `workspaces` array with `pnpm-workspace.yaml` (which also carries pnpm settings). Update Lerna to use pnpm as npm client. Replace npm-check-updates with `pnpm up --recursive --latest`.

**Tech Stack:** pnpm 10.33.0, Lerna 9, syncpack 14, husky 9

---

### Task 1: Create `pnpm-workspace.yaml`

**Files:**
- Create: `pnpm-workspace.yaml`

- [ ] **Step 1: Create the file**

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

settings:
  shamefullyHoist: false
```

- [ ] **Step 2: Verify file exists**

Run: `cat pnpm-workspace.yaml`
Expected: file contents printed, no error

---

### Task 2: Update `lerna.json`

**Files:**
- Modify: `lerna.json`

- [ ] **Step 1: Add `npmClient`**

Replace the full file content with:

```json
{
	"$schema": "node_modules/lerna/schemas/lerna-schema.json",
	"version": "independent",
	"npmClient": "pnpm",
	"command": {
		"publish": {
			"message": "(chore): publish version %v"
		}
	}
}
```

- [ ] **Step 2: Verify**

Run: `cat lerna.json`
Expected: `"npmClient": "pnpm"` present in output

---

### Task 3: Update root `package.json`

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Replace full file content**

```json
{
	"name": "toolkit",
	"version": "0.0.0",
	"description": "Yard Toolkit monorepo",
	"author": {
		"name": "Yard | Digital Agency",
		"email": "info@yard.nl",
		"url": "https://www.yard.nl/"
	},
	"license": "EUPL-1.2",
	"private": true,
	"packageManager": "pnpm@10.33.0",
	"scripts": {
		"lint:js": "yard-toolkit lint js -m custom ./packages/**/src/**/*.js",
		"format:js": "yard-toolkit format js -m custom ./packages/**/*.js",
		"dep:check": "syncpack list-mismatches",
		"dep:fix": "syncpack fix-mismatches",
		"dep:outdated": "pnpm outdated --recursive",
		"dep:update": "pnpm up --recursive --latest",
		"prepare": "husky"
	},
	"type": "commonjs",
	"devDependencies": {
		"husky": "^9.1.7",
		"lerna": "^9.0.4",
		"lint-staged": "^16.2.7",
		"syncpack": "^14.0.0"
	}
}
```

Changes from before:
- Removed `workspaces` array
- Added `"packageManager": "pnpm@10.33.0"`
- `dep:outdated` → `pnpm outdated --recursive`
- `dep:update` → `pnpm up --recursive --latest`
- Removed `npm-check-updates` from `devDependencies`

- [ ] **Step 2: Verify**

Run: `cat package.json`
Expected: no `workspaces` key, `packageManager` field present, no `npm-check-updates` dep

---

### Task 4: Swap lock file and install

**Files:**
- Delete: `package-lock.json`
- Delete: `node_modules/` (all workspace node_modules too)
- Generate: `pnpm-lock.yaml`

- [ ] **Step 1: Delete npm artefacts**

```bash
rm package-lock.json
rm -rf node_modules
rm -rf packages/*/node_modules
```

- [ ] **Step 2: Run pnpm install**

Run: `pnpm install`
Expected: output shows packages installed, `pnpm-lock.yaml` created, no errors

If install fails with a phantom-dep error (e.g. `Cannot find module 'X'` inside a package that doesn't declare `X`), fix by adding the missing dep to that package's `package.json` and re-running `pnpm install`. Do not set `shamefullyHoist: true`.

- [ ] **Step 3: Verify lock file created**

Run: `ls pnpm-lock.yaml`
Expected: file listed, no error

---

### Task 5: Verify tools still work

- [ ] **Step 1: syncpack**

Run: `pnpm dep:check`
Expected: exits 0 or lists mismatches (same behaviour as before)

- [ ] **Step 2: pnpm outdated**

Run: `pnpm dep:outdated`
Expected: table of outdated packages or clean output, no command-not-found error

- [ ] **Step 3: husky prepare**

Run: `pnpm prepare`
Expected: `husky` output, exits 0

- [ ] **Step 4: lerna dry-run**

Run: `pnpm exec lerna version --no-push --no-git-tag-version --yes 2>&1 | head -20`
Expected: Lerna detects packages, no `npmClient` error

---

### Task 6: Commit

- [ ] **Step 1: Stage all changes**

```bash
git add pnpm-workspace.yaml pnpm-lock.yaml lerna.json package.json
git rm package-lock.json
```

- [ ] **Step 2: Commit**

```bash
git commit -m "chore: migrate from npm workspaces to pnpm"
```
