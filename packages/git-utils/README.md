# `@theholocron/git-utils`

Parse git remote URLs, read a repo's remote, and maintain managed blocks in `.gitignore`.

Node-only (it shells out to `git` and touches the filesystem). Zero dependencies.

## Installation

```bash
pnpm add @theholocron/git-utils
```

## Usage

```typescript
import { parseGitRemoteUrl, readGitRemote, updateGitignore } from "@theholocron/git-utils";

parseGitRemoteUrl("git@github.com:theholocron/holocron.git");
// { host: "github.com", owner: "theholocron", repo: "holocron", slug: "theholocron/holocron" }

const remote = await readGitRemote(process.cwd()); // GitRemote | undefined

await updateGitignore(".gitignore", {
  start: "# managed by my-tool — skills",
  end: "# end managed by my-tool — skills",
  lines: ["/.agents/", "/.claude/skills/"],
});
```

### `parseGitRemoteUrl(url)`

Pure. Understands `https://host/owner/repo(.git)(/)` (with credentials or a
port), scp-style `git@host:owner/repo(.git)`, `ssh://git@host(:port)/owner/repo`
and `git://`, on any host. Nested groups stay in `owner` (`group/sub`). Returns
`{ host, owner, repo, slug }`, or `undefined` for a local path, an empty
string, or a URL with fewer than two path segments.

### `readGitRemote(cwd, options?)`

Runs `git remote get-url <remote>` in `cwd` and parses it. `undefined` when
`cwd` isn't a repository, there is no such remote, git isn't installed, or the
URL isn't understood. `options.remote` defaults to `"origin"`; `options.exec`
(`(args, { cwd }) => Promise<string>`, rejecting on a non-zero exit) is
injectable so tests don't need a real repository.

### `upsertManagedBlock(content, { start, end, lines })`

Pure. Inserts or replaces the lines between two marker lines, leaving the rest
of the text alone. Appends the block (blank-line separated) when it isn't there
yet; replaces it in place when it is. If `start` is present but `end` is
missing, the block is taken to run to the next blank line or end of file, so
the content after it is **kept**. Idempotent. There are no default markers —
choose them, and keep them stable so existing blocks are still found.

### `updateGitignore(path, options)`

`upsertManagedBlock` on a file; a missing file counts as empty and is created.
Writes only when the content changes, and resolves to `true` when it wrote.

## Documentation

Check out [The Holocron Archive](https://docs.theholocron.dev/projects/utils/) for more information.
