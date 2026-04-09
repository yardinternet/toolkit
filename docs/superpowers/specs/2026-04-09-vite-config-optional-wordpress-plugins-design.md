# Design: Optional WordPress Plugins in `createBasePackageConfig`

**Date:** 2026-04-09
**Scope:** `packages/vite-config`

## Background

`createBasePackageConfig` always includes two opinionated WordPress-specific plugins:

- `viteExternalsPlugin` — externalizes `react`, `react-dom`, and `react/jsx-runtime` to reference WordPress's `window.React`, `window.ReactDOM`, and `window.ReactJSXRuntime` globals.
- `wordpressPlugin` — transforms `@wordpress/*` imports to reference `window.wp` globals.

These defaults make sense for the agency's typical WordPress frontend context, but there are cases where one or both need to be disabled (e.g., a package not relying on WordPress-provided React, or a standalone utility with no `@wordpress/` dependencies).

## Design

### New options on `createBasePackageConfig`

Two boolean flags are added, both defaulting to `true`:

```js
export const createBasePackageConfig = ({
  // ...existing options unchanged...
  externalizeReact = true,
  wordpressGlobals = true,
} = {}) => { ... }
```

| Option | Default | Controls |
|---|---|---|
| `externalizeReact` | `true` | `viteExternalsPlugin` (React/ReactDOM/ReactJSXRuntime → window globals) |
| `wordpressGlobals` | `true` | `wordpressPlugin` (@wordpress/* → window.wp) |

### Plugin assembly

The plugin array is built conditionally and filtered:

```js
plugins: [
  externalizeReact && viteExternalsPlugin({
    react: 'React',
    'react-dom': 'ReactDOM',
    'react/jsx-runtime': 'ReactJSXRuntime',
  }),
  wordpressGlobals && wordpressPlugin(),
  dts(),
  ...plugins,
].filter(Boolean),
```

### `npmPackageConfig` and `laravelPackageConfig`

No changes required. Both already spread `...options` into `createBasePackageConfig`, so the new flags flow through naturally:

```js
npmPackageConfig({ externalizeReact: false })
laravelPackageConfig({ wordpressGlobals: false })
createBasePackageConfig({ externalizeReact: false, wordpressGlobals: false })
```

## What is not changing

- Default behavior is unchanged — both plugins remain enabled unless explicitly set to `false`.
- No changes to `npmPackageConfig`, `laravelPackageConfig`, or any other existing options.
- No changes to the `plugins` passthrough option (user-provided plugins are unaffected).
