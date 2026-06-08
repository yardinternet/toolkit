# Design: Test Suite for eslint-config and prettier-config

**Date:** 2026-06-08
**Scope:** `packages/eslint-config`, `packages/prettier-config`

## Goal

Catch two failure modes:
1. Dependency updates silently changing which rules are active or how code is formatted
2. Manual config edits accidentally disabling or weakening rules

## Approach

Approach C: snapshot the full resolved config as a regression guard, plus behavioral tests for explicitly configured rules and curated key rules. Both layers together — snapshot = canary, behavioral = proof.

## Architecture

Vitest installed as root-level devDependency (shared, no duplication per package). Root `vitest.workspace.js` discovers both packages. Each package owns its tests co-located in `tests/`.

```
yard-toolkit/
├── vitest.workspace.js
├── package.json                        ← adds "test": "vitest run"
│
├── packages/
│   ├── eslint-config/
│   │   ├── vitest.config.js
│   │   └── tests/
│   │       ├── config.snapshot.test.js
│   │       └── rules.test.js
│   │
│   └── prettier-config/
│       ├── vitest.config.js
│       └── tests/
│           ├── config.snapshot.test.js
│           └── format.test.js
```

Both packages are CommonJS. Test files use `require()`. Vitest handles CJS in Node environment without special config.

## eslint-config Tests

### Snapshot test (`config.snapshot.test.js`)

Use ESLint's `Linter` class to resolve the flat config against a `.js` filename. Serialize the resolved `rules` map (name → severity + options) to a Vitest snapshot. Any dep update or edit that adds, removes, or changes the severity of a rule fails this test.

```js
const { Linter } = require('eslint');
const config = require('../src/index.js');

test('resolved rules match snapshot', () => {
  const linter = new Linter({ configType: 'flat' });
  const fileConfig = linter.getConfigForFile('test.js', config);
  expect(fileConfig.rules).toMatchSnapshot();
});
```

### Behavioral tests (`rules.test.js`)

Use `Linter.verify()` with inline code strings. Two categories:

**Explicitly configured rules** (defined in `src/index.js`):

| Rule | Should error | Should pass |
|---|---|---|
| `no-unused-expressions` | `x && doThing();` | `x ? a() : b();` (allowTernary) |
| `import/no-unresolved` | `import './missing-file'` | `import '@wordpress/foo'` (ignored) |
| `import/no-extraneous-dependencies` | any import | OK — rule disabled |
| `prettier/prettier` | any code | OK — rule disabled |
| `jsdoc/require-param` | undocumented param | OK — rule disabled |

**WordPress plugin load verification** — rules that only exist if `@wordpress/eslint-plugin/recommended` is active:

| Rule | Should error |
|---|---|
| `@wordpress/no-unsafe-wp-apis` | `import { __experimentalFoo } from '@wordpress/bar'` |
| `@wordpress/valid-sprintf` | `sprintf('%s %s', a)` (wrong arg count) |
| `@wordpress/no-unused-vars-before-return` | var used only after early return |

**Curated inherited rules** worth guarding:

| Rule | Should error | Should pass |
|---|---|---|
| `no-unused-vars` | `const x = 1;` (unused) | `const x = 1; return x;` |
| `no-console` | `console.log('x')` | — |

## prettier-config Tests

### Snapshot test (`config.snapshot.test.js`)

`findTailwindStylesheet()` runs at module load time and does filesystem scanning. Mock it to `null` for deterministic test environments.

```js
vi.mock('../src/utils/find-tailwind-stylesheet', () => ({ default: () => null }));
const config = require('../src/index.js');

test('config matches snapshot', () => {
  expect(config).toMatchSnapshot();
});
```

Catches any option change or plugin addition/removal in the config object.

### Format behavioral tests (`format.test.js`)

Call `prettier.format()` with the config's override options per file type. Snapshot the output — regenerate with `--update-snapshots` on intentional changes.

**wp-prettier fork verification (highest priority):**

`parenSpacing` is a WordPress-only option that standard `prettier` silently ignores. This test fails immediately if someone swaps the fork for standard prettier.

| Input | Expected output |
|---|---|
| `foo(bar, baz)` | `foo( bar, baz )` |

**JS/JSX overrides:**

| Input | Asserts |
|---|---|
| Double-quoted string, spaces, no trailing comma | tabs, single quotes, trailing commas, semis |
| `x => x` (no parens) | `(x) => x` (arrowParens: always) |
| Multiline JSX with bracket on same line | bracket moved to next line (bracketSameLine: false) |

**Blade overrides:**

Format a blade template with unsorted Tailwind classes, assert classes are sorted. Blade plugin is heavier — mark these tests with `.skip` if they cause CI timeout issues, but include by default.

## CI Integration

### 1. Root package.json

```json
"test": "vitest run"
```

### 2. GitHub Actions (`.github/workflows/test.yml`)

Triggers on `push` and `pull_request`. Runs before Dependabot automerge, catching dep updates that break config behavior.

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
```

### 3. Husky pre-push hook

Run tests locally before pushing. Pre-commit is too slow for this; pre-push is the right hook.

```sh
# .husky/pre-push
pnpm test
```

**Dependabot synergy:** existing automerge workflow + new test workflow form a safe auto-update loop — Dependabot bumps a dep → tests run → merge only if green.

## Updating Snapshots

When making intentional config changes, update snapshots explicitly:

```sh
pnpm vitest run --update-snapshots
```

Review the diff in the snapshot files before committing — it shows exactly what changed in the resolved rule set or formatted output.
