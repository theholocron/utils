# theholocron/utils — agent operating contract

`CLAUDE.md` is a symlink to this file, so Claude, Codex, and every other agent
read the same rules. Put durable, repo-wide agent guidance here.

@../github-private/AGENTS.md

## Architecture

- **pnpm workspace monorepo** with Turborepo for task orchestration.
- Each package under `packages/` is an independently published npm package.
- All packages compile TypeScript source (`src/`) to `dist/` via `tsdown`.
- Packages are versioned in lockstep via semantic-release (`release.config.ts`).

## Packages

| Package                        | Description                                           | Notes                                                                              |
| ------------------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `@theholocron/array-utils`     | Array conversion and manipulation                     |                                                                                    |
| `@theholocron/date-time-utils` | Date and time utilities                               |                                                                                    |
| `@theholocron/env-utils`       | Runtime environment detection + typed env-var parsing | Merged from `@magnite/environment` + `@magnite/env-parser`; `dotenv` is a peer dep |
| `@theholocron/location-utils`  | Browser geolocation wrapper                           | Uses browser APIs — no tests yet (see #166)                                        |
| `@theholocron/misc-utils`      | Miscellaneous utilities (Konami code, etc.)           | Uses browser APIs (`KeyboardEvent`)                                                |
| `@theholocron/storage-utils`   | Session storage wrapper                               | Uses browser APIs (`sessionStorage`) — coverage at 62% (see #167)                  |
| `@theholocron/string-utils`    | String casing, casting, and numbering                 | Externalises `change-case` + `title-case`                                          |
| `@theholocron/uri-utils`       | URL search param utilities                            |                                                                                    |

## Code patterns

- **Browser-API packages** (`location-utils`, `misc-utils`, `storage-utils`): tsconfigs
  include `"lib": ["dom", "dom.iterable", "es2022"]`. ESLint disables
  `n/no-unsupported-features/node-builtins` for those packages — their code is
  browser-targeted, not Node.js.
- **`n/no-unpublished-import`** is off in the root `eslint.config.ts`. False
  positive for the TypeScript `src/ → dist/` build model.
- **Root `tsconfig.json`** covers root-level config files only (excludes
  `packages/`). Each package has its own tsconfig for type-checking.
- **`globals: true`** must be set in every package's `vitest.config.ts` — tests
  were written without explicit `import { describe, it } from "vitest"`.
- **`tsdown` and `vitest`** must be direct devDeps in each package (pnpm does not
  expose transitive binaries).

## Adding a new utility package

1. Create `packages/<name>-utils/` with `src/index.ts`, `package.json`, `tsdown.config.ts`, `vitest.config.ts`, and `tsconfig.json`.
2. Re-export from `@theholocron/tsdown-config/presets/library` and `@theholocron/vitest-config/bundles/library` (pass `globals: true`).
3. If the package uses browser APIs, add `"lib": ["dom", "dom.iterable", "es2022"]` to its tsconfig and add the browser-package override to the root `eslint.config.ts`.
4. Add the package path to `prepareCmd` in `release.config.ts` (keep alphabetical order).
5. Add a `component_id` entry to `codecov.yml`.

## Quality

- `pnpm build` — tsdown across all packages via Turbo.
- `pnpm test` — vitest across all packages via Turbo.
- `pnpm typecheck` — `tsc --noEmit` in each package via Turbo.
- `pnpm lint` — ESLint via Turbo.
