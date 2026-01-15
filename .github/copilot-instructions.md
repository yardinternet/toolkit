# Copilot Instructions for Yard Toolkit

## Project Overview
- **Yard Toolkit** is a monorepo of configuration and CLI tools for building, formatting, linting, and managing WordPress sites/packages.
- Major packages: `prettier-config`, `eslint-config`, `stylelint-config`, `postcss-config`, `vite-config`, and the central `toolkit` CLI.
- The `toolkit` package is the main entry point for developer workflows (format, lint, build, watch) and must explicitly declare all dependencies used by any config/tool package (see Note on pnpm below).

## Key Developer Workflows
- **Format code:** `yard-toolkit format [filetype] [-m mode] [globs]`
- **Lint code:** `yard-toolkit lint [filetype] [--no-fix] [-m mode] [globs]`
- **Build assets:** `yard-toolkit build [themes|blocks]`
- **Watch assets:** `yard-toolkit watch [themes|blocks]`
- **Release packages:** `lerna publish --no-private`
- **Dependency management:**
  - `npm run dep:check` (list mismatches)
  - `npm run dep:fix` (fix mismatches)
  - `npm run dep:outdated` (list outdated)
  - `npm run dep:update` (update all)

## Project Structure & Patterns
- All CLI actions are implemented in `packages/toolkit/src/actions/` and registered in `config/actions.js`.
- Filetypes, modes, and options are extensible via `config/filetypes.js`, `config/modes.js`, and `config/options.js`.
- Help output and CLI docs are maintained in `config/help.js`.
- Each config package (`eslint-config`, `prettier-config`, etc.) is self-contained but may be consumed by the toolkit CLI.
- **pnpm users:** All dependencies (including those from config packages) must be declared in `toolkit/package.json` due to pnpm's strict hoisting rules.

## Conventions & Examples
- Scripts in `package.json` should use toolkit CLI for lint/format/build/watch (see toolkit README for examples).
- To add a new CLI action, filetype, mode, or option, follow the documented patterns in `packages/toolkit/README.md`.
- When adding new config, update both the relevant config file and the help output.

## References
- See [packages/toolkit/README.md](../packages/toolkit/README.md) for detailed CLI usage, extension patterns, and dependency notes.
- See [README.md](../README.md) for monorepo structure and package links.

---

**Note:** Always check for explicit dependency declarations in `toolkit/package.json` when using pnpm.
