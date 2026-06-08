# Config Test Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Vitest snapshot + behavioral tests to `eslint-config` and `prettier-config` packages, catching silent config drift from dependency updates and manual edits.

**Architecture:** Vitest installed at workspace root; `vitest.workspace.mjs` discovers per-package `vitest.config.mjs` files. Each package gets a `tests/` directory with a snapshot test (serializes the full config) and a behavioral test (lints/formats real code). CI via GitHub Actions workflow + Husky pre-push hook.

**Tech Stack:** Vitest 3.x, ESLint `Linter` class (flat config), `prettier.format()` + `prettier.resolveConfig()`, pnpm workspace, Husky, GitHub Actions

---

## File Map

**Create:**
- `vitest.workspace.mjs` — root workspace discovery
- `packages/eslint-config/vitest.config.mjs` — per-package Vitest config
- `packages/eslint-config/tests/config.snapshot.test.js` — snapshots resolved config array
- `packages/eslint-config/tests/rules.test.js` — behavioral rule tests
- `packages/prettier-config/vitest.config.mjs` — per-package Vitest config
- `packages/prettier-config/tests/config.snapshot.test.js` — snapshots config object
- `packages/prettier-config/tests/format.test.js` — behavioral format tests
- `.github/workflows/test.yml` — CI test workflow
- `.husky/pre-push` — pre-push hook

**Modify:**
- `package.json` (root) — add `test` script + `vitest` devDep
- `packages/eslint-config/package.json` — add `test` script + devDeps
- `packages/prettier-config/package.json` — add `test` script + devDeps

---

## Task 1: Install Vitest at workspace root

**Files:**
- Modify: `package.json`
- Create: `vitest.workspace.mjs`

- [ ] **Step 1: Add vitest to root devDependencies**

```bash
pnpm add -Dw vitest
```

Expected: `package.json` now lists `vitest` under `devDependencies`.

- [ ] **Step 2: Add test script to root package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run"
```

- [ ] **Step 3: Create workspace discovery file**

Create `vitest.workspace.mjs` at the repo root:

```js
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/eslint-config/vitest.config.mjs',
  'packages/prettier-config/vitest.config.mjs',
]);
```

- [ ] **Step 4: Verify vitest resolves**

```bash
pnpm vitest run --reporter=verbose 2>&1 | head -20
```

Expected: "No test files found" or vitest starts without error (no test files yet).

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.workspace.mjs
git commit -m "chore: install vitest at workspace root"
```

---

## Task 2: Setup eslint-config package for testing

**Files:**
- Modify: `packages/eslint-config/package.json`
- Create: `packages/eslint-config/vitest.config.mjs`

- [ ] **Step 1: Add devDependencies to eslint-config**

`eslint` is needed for `Linter`/`ESLint` classes in tests. `vitest` for test utilities.

```bash
pnpm add -D vitest eslint --filter @yardinternet/eslint-config
```

- [ ] **Step 2: Add test script to eslint-config package.json**

In `packages/eslint-config/package.json`, add to `"scripts"`:
```json
"test": "vitest run"
```

- [ ] **Step 3: Create per-package vitest config**

Create `packages/eslint-config/vitest.config.mjs`:

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
```

`globals: true` makes `test`, `expect`, `describe`, `vi` available without imports in test files (matches the CJS style of this package).

- [ ] **Step 4: Commit**

```bash
git add packages/eslint-config/package.json packages/eslint-config/vitest.config.mjs pnpm-lock.yaml
git commit -m "chore(eslint-config): add vitest setup"
```

---

## Task 3: ESLint config snapshot test

**Files:**
- Create: `packages/eslint-config/tests/config.snapshot.test.js`
- Create: `packages/eslint-config/tests/__snapshots__/config.snapshot.test.js.snap` (auto-generated)

The eslint-config exports a flat config array. The array includes the output of `compat.extends()`, which resolves `@wordpress/eslint-plugin/recommended` into flat config objects at module-load time. Snapshotting the full array captures all inherited rules — any dep update that changes them will break this test.

- [ ] **Step 1: Create the snapshot test**

Create `packages/eslint-config/tests/config.snapshot.test.js`:

```js
'use strict';

const config = require('../src/index.js');

test('eslint config array length is stable', () => {
  // If a plugin adds or removes config objects, this catches it immediately.
  expect(Array.isArray(config)).toBe(true);
  // Snapshot the count — fails when @wordpress/eslint-plugin adds/removes config blocks.
  expect(config.length).toMatchSnapshot();
});

test('eslint config explicit rules match snapshot', () => {
  // Snapshot only the rule maps (serializable). Functions like parsers/plugins
  // are excluded here — their presence is verified in behavioral tests.
  const ruleEntries = config
    .filter((c) => c.rules && Object.keys(c.rules).length > 0)
    .map((c) => c.rules);
  expect(ruleEntries).toMatchSnapshot();
});

test('eslint config files patterns match snapshot', () => {
  const filePatterns = config
    .filter((c) => c.files)
    .map((c) => c.files);
  expect(filePatterns).toMatchSnapshot();
});
```

- [ ] **Step 2: Run to generate snapshots**

```bash
pnpm --filter @yardinternet/eslint-config test
```

Expected: 3 tests pass. Snapshot file created at `packages/eslint-config/tests/__snapshots__/config.snapshot.test.js.snap`.

- [ ] **Step 3: Review the generated snapshot**

```bash
cat packages/eslint-config/tests/__snapshots__/config.snapshot.test.js.snap
```

Verify the snapshot contains recognizable rule names (`no-unused-vars`, `@wordpress/*` rules, etc.). If the snapshot is empty or doesn't contain WordPress rules, the `compat.extends()` did not resolve correctly — investigate before committing.

- [ ] **Step 4: Commit tests and snapshots**

```bash
git add packages/eslint-config/tests/
git commit -m "test(eslint-config): add config snapshot test"
```

---

## Task 4: ESLint explicit rules behavioral tests

**Files:**
- Create: `packages/eslint-config/tests/rules.test.js`

Uses `Linter.verify()` (synchronous, no file I/O) with the exported flat config array. The `Linter` class in ESLint 9 accepts flat config arrays directly in `verify()`.

- [ ] **Step 1: Create the behavioral test file**

Create `packages/eslint-config/tests/rules.test.js`:

```js
'use strict';

const { Linter } = require('eslint');
const config = require('../src/index.js');

const linter = new Linter({ configType: 'flat' });

/**
 * Lint a code string and return only messages for a specific rule.
 * filename must match the config's files pattern (e.g. '**\/*.js').
 */
function messagesForRule(code, ruleId, filename = 'test.js') {
  return linter.verify(code, config, { filename }).filter(
    (m) => m.ruleId === ruleId
  );
}

describe('explicitly configured rules', () => {
  describe('no-unused-expressions', () => {
    test('errors on unused logical AND expression', () => {
      // Short-circuit `x && foo()` is an unused expression — not allowed.
      const messages = messagesForRule(
        'var x = true; x && foo();',
        'no-unused-expressions'
      );
      expect(messages.length).toBeGreaterThan(0);
    });

    test('allows ternary expressions (allowTernary: true)', () => {
      // `x ? a() : b()` is allowed because allowTernary is true.
      const messages = messagesForRule(
        'var x = true; x ? foo() : bar();',
        'no-unused-expressions'
      );
      expect(messages).toHaveLength(0);
    });
  });

  describe('import/no-unresolved', () => {
    test('ignores @wordpress/* imports (configured ignore pattern)', () => {
      // The config sets ignore: ['^@wordpress/'] — these must not error.
      const messages = messagesForRule(
        `import { useSelect } from '@wordpress/data';`,
        'import/no-unresolved'
      );
      expect(messages).toHaveLength(0);
    });
  });

  describe('disabled rules', () => {
    test('prettier/prettier is disabled (severity 0)', () => {
      // Must not fire regardless of formatting.
      const messages = messagesForRule(
        `var x="ugly"`,
        'prettier/prettier'
      );
      expect(messages).toHaveLength(0);
    });

    test('import/no-extraneous-dependencies is disabled', () => {
      const messages = messagesForRule(
        `import foo from 'some-unlisted-package';`,
        'import/no-extraneous-dependencies'
      );
      expect(messages).toHaveLength(0);
    });

    test('jsdoc/require-param is disabled', () => {
      // A function with an undocumented param must not trigger jsdoc errors.
      const messages = messagesForRule(
        `/** @returns {void} */ function foo(undocumented) {}`,
        'jsdoc/require-param'
      );
      expect(messages).toHaveLength(0);
    });
  });
});

describe('curated inherited rules', () => {
  test('no-unused-vars errors on declared-but-unused variable', () => {
    const messages = messagesForRule(
      'const unused = 1;',
      'no-unused-vars'
    );
    expect(messages.length).toBeGreaterThan(0);
  });

  test('no-console errors on console.log call', () => {
    const messages = messagesForRule(
      `console.log('hello');`,
      'no-console'
    );
    expect(messages.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the tests**

```bash
pnpm --filter @yardinternet/eslint-config test
```

Expected: all tests in `rules.test.js` pass. If `no-console` does not produce a message, the rule may be off — check the snapshot from Task 3 to confirm `no-console` is active.

- [ ] **Step 3: Commit**

```bash
git add packages/eslint-config/tests/rules.test.js
git commit -m "test(eslint-config): add behavioral rule tests"
```

---

## Task 5: ESLint WordPress plugin verification tests

**Files:**
- Modify: `packages/eslint-config/tests/rules.test.js`

These tests prove `@wordpress/eslint-plugin/recommended` is loaded and enforcing. If the plugin stops loading (e.g. wrong package name after a rename), these fail even if the snapshot looks unchanged.

- [ ] **Step 1: Add WordPress plugin tests to rules.test.js**

Append to the bottom of `packages/eslint-config/tests/rules.test.js`:

```js
describe('@wordpress/eslint-plugin/recommended is loaded', () => {
  test('@wordpress/no-unsafe-wp-apis flags __experimental imports', () => {
    // This rule only exists if the WordPress plugin is loaded.
    // Import of an __experimental export must produce an error.
    const messages = messagesForRule(
      `import { __experimentalFoo } from '@wordpress/components';`,
      '@wordpress/no-unsafe-wp-apis'
    );
    expect(messages.length).toBeGreaterThan(0);
  });

  test('@wordpress/no-unsafe-wp-apis flags __unstable imports', () => {
    const messages = messagesForRule(
      `import { __unstableBar } from '@wordpress/block-editor';`,
      '@wordpress/no-unsafe-wp-apis'
    );
    expect(messages.length).toBeGreaterThan(0);
  });

  test('@wordpress/no-unsafe-wp-apis allows stable imports', () => {
    // A stable export from a @wordpress package must not be flagged.
    const messages = messagesForRule(
      `import { useSelect } from '@wordpress/data';`,
      '@wordpress/no-unsafe-wp-apis'
    );
    expect(messages).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run all eslint-config tests**

```bash
pnpm --filter @yardinternet/eslint-config test
```

Expected: all tests pass, including the 3 new `@wordpress/no-unsafe-wp-apis` tests.

If the `@wordpress/no-unsafe-wp-apis` tests fail with "rule not found", the plugin is not loading — recheck that `compat.extends('plugin:@wordpress/eslint-plugin/recommended')` resolves correctly at import time.

- [ ] **Step 3: Commit**

```bash
git add packages/eslint-config/tests/rules.test.js
git commit -m "test(eslint-config): add WordPress plugin load verification tests"
```

---

## Task 6: Setup prettier-config package for testing

**Files:**
- Modify: `packages/prettier-config/package.json`
- Create: `packages/prettier-config/vitest.config.mjs`

- [ ] **Step 1: Add vitest devDependency**

`prettier` is already a dependency of the package so `prettier.format()` and `prettier.resolveConfig()` are available without extra installs.

```bash
pnpm add -D vitest --filter @yardinternet/prettier-config
```

- [ ] **Step 2: Add test script**

In `packages/prettier-config/package.json`, add to `"scripts"`:
```json
"test": "vitest run"
```

- [ ] **Step 3: Create per-package vitest config**

Create `packages/prettier-config/vitest.config.mjs`:

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    testTimeout: 15000, // prettier format can be slow for blade files
  },
});
```

- [ ] **Step 4: Commit**

```bash
git add packages/prettier-config/package.json packages/prettier-config/vitest.config.mjs pnpm-lock.yaml
git commit -m "chore(prettier-config): add vitest setup"
```

---

## Task 7: Prettier config snapshot test

**Files:**
- Create: `packages/prettier-config/tests/config.snapshot.test.js`

`findTailwindStylesheet()` runs at `require()` time. In the test environment there is no `web/app/themes/sage/resources/styles/base/config.css`, so it returns `null` and `tailwindStylesheet` is not included in the config — making the snapshot deterministic without any mocking.

`plugins` contains absolute paths from `require.resolve()` which differ per machine. Exclude from snapshot; verify by name instead.

- [ ] **Step 1: Create the snapshot test**

Create `packages/prettier-config/tests/config.snapshot.test.js`:

```js
'use strict';

const config = require('../src/index.js');

test('prettier config options match snapshot (excludes machine-specific plugin paths)', () => {
  // Omit plugins: they contain absolute paths that differ per machine.
  const { plugins, ...options } = config;
  expect(options).toMatchSnapshot();
});

test('blade plugin is configured', () => {
  expect(config.plugins.some((p) => p.includes('prettier-plugin-blade'))).toBe(true);
});

test('tailwindcss plugin is configured', () => {
  expect(config.plugins.some((p) => p.includes('prettier-plugin-tailwindcss'))).toBe(true);
});

test('tailwindStylesheet is not present in test environment', () => {
  // Confirms findTailwindStylesheet() returns null outside a real project.
  // If this fails, snapshot tests may become non-deterministic.
  expect(config.tailwindStylesheet).toBeUndefined();
});
```

- [ ] **Step 2: Run to generate snapshot**

```bash
pnpm --filter @yardinternet/prettier-config test
```

Expected: 4 tests pass. Snapshot created at `packages/prettier-config/tests/__snapshots__/config.snapshot.test.js.snap`.

- [ ] **Step 3: Review the snapshot**

```bash
cat packages/prettier-config/tests/__snapshots__/config.snapshot.test.js.snap
```

Confirm the snapshot shows `overrides` with the JS and blade file options, and base options from `@wordpress/prettier-config`.

- [ ] **Step 4: Commit**

```bash
git add packages/prettier-config/tests/
git commit -m "test(prettier-config): add config snapshot test"
```

---

## Task 8: wp-prettier fork verification + JS format behavioral tests

**Files:**
- Create: `packages/prettier-config/tests/format.test.js`

`prettier.resolveConfig(filePath, { config })` applies the config's `overrides` based on the `filePath` extension. Passing a `.js` path applies the JS override options. `prettier.format()` then formats with those options.

`parenSpacing: true` is a WordPress-only option added by the `wp-prettier` fork. Standard `prettier` ignores it silently. If `prettier` is swapped for the standard package, `foo(bar)` stays as `foo(bar)` instead of becoming `foo( bar )` — the fork test catches this immediately.

- [ ] **Step 1: Create format test file**

Create `packages/prettier-config/tests/format.test.js`:

```js
'use strict';

const prettier = require('prettier');
const path = require('path');

// Resolve config for a given filename — applies the correct override options.
const CONFIG_PATH = path.resolve(__dirname, '../src/index.js');

async function resolveOptions(filename) {
  return prettier.resolveConfig(path.join(__dirname, filename), {
    config: CONFIG_PATH,
  });
}

describe('wp-prettier fork verification', () => {
  test('parenSpacing adds spaces inside function call parentheses', async () => {
    // CRITICAL: parenSpacing is a wp-prettier–only option.
    // Standard prettier silently ignores it — foo(bar) stays foo(bar).
    // If this test fails, the wrong prettier fork is installed.
    const options = await resolveOptions('test.js');
    const output = await prettier.format('foo(bar, baz)', {
      ...options,
      parser: 'babel',
    });
    expect(output.trim()).toBe('foo( bar, baz );');
  });

  test('parenSpacing adds spaces in nested calls', async () => {
    const options = await resolveOptions('test.js');
    const output = await prettier.format('outer(inner(x))', {
      ...options,
      parser: 'babel',
    });
    expect(output.trim()).toBe('outer( inner( x ) );');
  });
});

describe('JS override options', () => {
  test('uses tabs for indentation', async () => {
    const options = await resolveOptions('test.js');
    const output = await prettier.format(
      `function foo() {\nreturn "hello"\n}`,
      { ...options, parser: 'babel' }
    );
    // Indented line must start with a tab, not spaces.
    expect(output).toMatch(/\n\t/);
  });

  test('converts double quotes to single quotes', async () => {
    const options = await resolveOptions('test.js');
    const output = await prettier.format(`const x = "hello";`, {
      ...options,
      parser: 'babel',
    });
    expect(output).toContain("'hello'");
    expect(output).not.toContain('"hello"');
  });

  test('adds trailing commas in objects (es5)', async () => {
    const options = await resolveOptions('test.js');
    const output = await prettier.format(
      `const obj = {\n  a: 1,\n  b: 2\n};`,
      { ...options, parser: 'babel' }
    );
    // Last property must have a trailing comma before closing brace.
    expect(output).toMatch(/b: 2,\n/);
  });

  test('adds semicolons', async () => {
    const options = await resolveOptions('test.js');
    const output = await prettier.format(`const x = 1`, {
      ...options,
      parser: 'babel',
    });
    expect(output.trim()).toMatch(/;$/);
  });

  test('always wraps arrow function params in parens (arrowParens: always)', async () => {
    const options = await resolveOptions('test.js');
    const output = await prettier.format(`const fn = x => x;`, {
      ...options,
      parser: 'babel',
    });
    expect(output).toContain('(x) =>');
  });
});
```

- [ ] **Step 2: Run tests**

```bash
pnpm --filter @yardinternet/prettier-config test
```

Expected: all tests in `format.test.js` pass. If `parenSpacing` tests fail, verify `packages/prettier-config/node_modules/prettier/package.json` is `wp-prettier` not standard `prettier`.

- [ ] **Step 3: Commit**

```bash
git add packages/prettier-config/tests/format.test.js
git commit -m "test(prettier-config): add wp-prettier fork verification and JS format tests"
```

---

## Task 9: Blade format behavioral tests

**Files:**
- Modify: `packages/prettier-config/tests/format.test.js`

The blade override sets `parser: 'blade'`, `sortTailwindcssClasses: true`, `tabWidth: 1`, `printWidth: 120`. Formatting a blade template verifies the blade plugin is loaded and the Tailwind class sorter works.

- [ ] **Step 1: Append blade tests to format.test.js**

Add at the bottom of `packages/prettier-config/tests/format.test.js`:

```js
describe('blade override options', () => {
  test('reorders tailwind classes (sortTailwindcssClasses: true)', async () => {
    const options = await resolveOptions('test.blade.php');
    // Classes in an unsorted order — the sorter must reorder them.
    // @shufo/tailwindcss-class-sorter uses Tailwind's utility order, not alphabetical.
    // We assert the output differs from input rather than hardcoding the exact order.
    const input = `<div class="z-10 mt-4 bg-white p-2 text-sm">content</div>\n`;
    const output = await prettier.format(input, {
      ...options,
      parser: 'blade',
    });
    // Sorted output must differ from original class order.
    expect(output).not.toContain('z-10 mt-4 bg-white p-2 text-sm');
  });

  test('blade formatted output matches snapshot', async () => {
    const options = await resolveOptions('test.blade.php');
    const input = [
      '@if($show)',
      '<div class="z-10 mt-4 bg-white">',
      '@foreach($items as $item)',
      '<span>{{ $item }}</span>',
      '@endforeach',
      '</div>',
      '@endif',
    ].join('\n');
    const output = await prettier.format(input, {
      ...options,
      parser: 'blade',
    });
    expect(output).toMatchSnapshot();
  });
});
```

- [ ] **Step 2: Run all prettier-config tests**

```bash
pnpm --filter @yardinternet/prettier-config test
```

Expected: all tests pass including the 2 new blade tests. If `@shufo/prettier-plugin-blade` throws a parse error, verify the blade input is valid and the plugin version supports the syntax.

- [ ] **Step 3: Commit**

```bash
git add packages/prettier-config/tests/format.test.js packages/prettier-config/tests/__snapshots__/
git commit -m "test(prettier-config): add blade format tests"
```

---

## Task 10: Run full test suite from root

Before adding CI, verify the workspace-level test command works.

- [ ] **Step 1: Run all tests from workspace root**

```bash
pnpm test
```

Expected: all tests across both packages pass. Output shows both `eslint-config` and `prettier-config` test results.

- [ ] **Step 2: Verify test count**

Output should show at least:
- `eslint-config`: ~12 tests (3 snapshot + 9 behavioral)
- `prettier-config`: ~11 tests (4 snapshot + 7 behavioral)

---

## Task 11: GitHub Actions test workflow

**Files:**
- Create: `.github/workflows/test.yml`

Runs on every push and pull request. The existing `dependabot-automerge.yml` workflow auto-merges Dependabot PRs — this new workflow runs tests before that merge, catching dep updates that break configs.

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/test.yml`:

```yaml
name: Test

on:
  push:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/test.yml
git commit -m "ci: add test workflow"
```

---

## Task 12: Husky pre-push hook

**Files:**
- Create: `.husky/pre-push`

Runs tests locally before every push. The existing `.husky/pre-commit` runs `lint-staged` — pre-push is the right place for the full test suite (too slow for pre-commit).

- [ ] **Step 1: Create pre-push hook**

Create `.husky/pre-push`:

```sh
pnpm test
```

- [ ] **Step 2: Make the hook executable**

```bash
chmod +x .husky/pre-push
```

- [ ] **Step 3: Verify hook runs on push**

```bash
git push --dry-run 2>&1 | head -5
```

Expected: Husky intercepts, runs `pnpm test`, all pass, then dry-run push proceeds (or fails on "dry-run" as expected).

- [ ] **Step 4: Commit**

```bash
git add .husky/pre-push
git commit -m "chore: add pre-push hook to run tests"
```

---

## Updating snapshots after intentional changes

When you intentionally change a config rule, run:

```bash
pnpm vitest run --update-snapshots
```

Review the diff in `__snapshots__/` files before committing — it shows exactly which rules changed severity or which format options changed. This review is the payoff: accidental changes are caught, intentional ones are documented in the snapshot diff.
