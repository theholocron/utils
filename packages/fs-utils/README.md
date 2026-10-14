# `@theholocron/fs-utils`

Walk a directory tree upward to find the nearest match or project root.

## Installation

```bash
pnpm add @theholocron/fs-utils
```

## Usage

```typescript
import { findRoot, findUpward, hasGitEntry } from "@theholocron/fs-utils";

// nearest ancestor holding a marker file or directory
const repoRoot = await findRoot(process.cwd(), ".git");
const monorepoRoot = await findRoot(process.cwd(), ["pnpm-workspace.yaml", "turbo.json"]);

// find the nearest ancestor holding a config file, stopping at the repo root
const configDir = await findUpward(
  process.cwd(),
  async (dir) => ((await fileExists(join(dir, "app.config.json"))) ? dir : undefined),
  hasGitEntry
);

// a plain boundary check, usable as `findUpward`'s `stop` or on its own
await hasGitEntry("/path/to/dir"); // true if a .git entry (file or folder) exists there
```

### `findUpward(startDir, check, stop?)`

Walks upward from `startDir` — itself first, then its parent, and so on —
calling `check(dir)` at each directory and returning the first result
that isn't `undefined`. When given, `stop(dir)` is checked only after
`check` has already come back empty for that directory (so it's still
fully checked before stopping) — returning `true` ends the walk there
with no result, instead of continuing to the parent. Without `stop`,
walks all the way to the filesystem root. Always terminates: directory
nesting is finite.

### `findRoot(startDir, marker, options?)` / `findRootSync(...)`

The nearest ancestor of `startDir` — itself first — that contains `marker`: a
file or directory name, or a list of names where any one counts. Resolves to
`undefined` when nothing is found. `findRootSync` is the synchronous twin.

- `options.fallback: "start"` — return the start directory instead of
  `undefined` when nothing is found (a soft-skip for callers that treat the
  start dir as the root anyway).
- `options.realpath: true` — resolve symlinks and relative segments of
  `startDir` before walking. A relative start otherwise hits `dirname`'s fixed
  point (`"."`) a couple of steps up, and a symlinked one walks the link's own
  ancestors instead of the physical tree. A start path that doesn't exist
  counts as not found.

```typescript
// a git root that never throws and never returns undefined
const root = findRootSync(cwd, ".git", { fallback: "start", realpath: true });
```

### `hasGitEntry(dir)`

Returns `true` when `dir` has a `.git` entry — a directory in a normal
checkout, a file in a worktree/submodule (existence is all that matters).
A common `stop` boundary for `findUpward`: treat the nearest `.git` as
the project root, searched but not walked past.

## Documentation

Check out [The Holocron Archive](https://docs.theholocron.dev/projects/utils/) for more information.
