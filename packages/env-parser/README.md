# `@magnite/env-parser`

Parse `process.env` into a structured config object. No more `process.env` scattered across your app code.

```
src/
  types.ts              ← EnvLoader interface, EnvParser interface, options
  loader.ts             ← DotenvLoader (the default strategy)
  parser.ts             ← parseKey(), normalizeKey(), getByPath(), buildEnvObject()
  debug.ts              ← observe integration, never logs in deployed envs
  create-env-parser.ts  ← the main factory
  index.ts              ← public exports

  parser.test.ts        ← unit tests for key parsing, normalization, traversal
  create-env-parser.test.ts ← integration tests for get(), map(), deprecate()
```

## Why this exists

When you're running multiple apps in a monorepo, `process.env` becomes a mess — it's global, untyped, and gives you no signal about which service a variable belongs to or where it came from. This library:

- Loads your `.env` once via dotenv, then gets out of the way
- Converts the raw flat `process.env` into a structured object you actually import
- Gives you a safe fallback pattern for renaming env vars without causing an outage
- Logs which keys were looked up and not found (locally only, never in deployed environments)

## The pattern

Every app has a single `config.ts`. That file is the only place `createEnvParser` is ever called. Everything else in the app imports from `config.ts` — nothing downstream ever touches `process.env` directly.

```
.env
└── createEnvParser()     ← runs once, in config.ts only
    ├── get()             ← used to look up individual keys
    ├── map()             ← used to define your config shape
    └── config (export)   ← the only thing the rest of the app imports
```

## Key naming convention

The only convention is the `__` separator. A single `_` is preserved as-is in the key name. A double `__` means "nest one level deeper."

| Env var                  | Parsed shape                         |
| ------------------------ | ------------------------------------ |
| `DATABASE_URL`           | `{ database_url: "" }`               |
| `ALLM__SERVICE__URL`     | `{ allm: { service: { url: "" } } }` |
| `ALLM__SERVICE_NAME`     | `{ allm: { service_name: "" } }`     |
| `NEW_RELIC__LICENSE_KEY` | `{ new_relic: { license_key: "" } }` |

All keys are lowercased. Values are coerced by default: `"true"` → `true`, `"42"` → `42`, everything else stays a string.

## Installation

```bash
pnpm add @magnite/env-parser
```

## get() key syntax

`get()` accepts any of four formats — they all resolve to the same value for nested keys. Use whichever feels natural.

| Syntax                      | Example                   | Behavior        |
| --------------------------- | ------------------------- | --------------- |
| Dot                         | `get("service.db.url")`   | traversal       |
| Double underscore           | `get("service__db__url")` | traversal       |
| Uppercase double underscore | `get("SERVICE__DB__URL")` | traversal       |
| Single underscore           | `get("service_db_url")`   | flat key lookup |

Single underscore is always a flat key — it is never a traversal separator. `get("service_db_url")` and `get("service.db.url")` are **independent lookups** and may resolve to different things.

`get()` returns `undefined` if a key doesn't exist, and warns locally via `observe`. **The consuming app decides what's required** — the library never crashes for you.

## Basic usage

```ts
// src/config.ts
import { createEnvParser } from "@magnite/env-parser";

const { get, map } = createEnvParser({ appName: "my-service" });

export const config = map((get) => ({
  port: get("port") ?? 3000,
  database: {
    url: get("database_url"),
  },
}));
```

Then anywhere in your app:

```ts
import { config } from "./config.js";

app.listen(config.port);
db.connect(config.database.url);
```

## Real-world examples

### A full app config

```ts
// apps/adcp-service/src/config.ts
import { createEnvParser } from "@magnite/env-parser";

const { map } = createEnvParser({ appName: "adcp-service" });

export const config = map((get) => ({
  port: get("port") ?? 3000,
  auth: {
    domain: get("auth0__domain"),
    clientId: get("auth0__client_id"),
    audience: get("auth0__audience"),
  },
  db: {
    url: get("database_url"),
    poolSize: get("database__pool_size") ?? 10,
  },
  adcp: {
    apiUrl: get("adcp__api__url"),
  },
}));
```

```ts
// apps/mcp-gateway/src/config.ts
import { createEnvParser } from "@magnite/env-parser";

const { map } = createEnvParser({ appName: "mcp-gateway" });

export const config = map((get) => ({
  port: get("port") ?? 3000,
  springserve: {
    baseUrl: get("springserve__base_url"),
    token: get("springserve__token"),
  },
}));
```

Each app has its own `createEnvParser` call with its own `appName`. Local debug output (when `DEBUG=true`) makes it immediately obvious which service a missing key belongs to:

```
WARN [env-parser:adcp-service]  Key not found: "database_url" — returned undefined
WARN [env-parser:mcp-gateway]   Key not found: "springserve__token" — returned undefined
```

### Renaming an env var without an outage

You have `DATABASE_URL` deployed everywhere. You want to rename it to `DB__PRIMARY__URL` so it nests cleanly, but you can't update all your infrastructure at once.

```bash
# .env — old
DATABASE_URL=postgres://prod-host/mydb

# .env — new (after migration is complete)
DB__PRIMARY__URL=postgres://prod-host/mydb
```

```ts
const { map, deprecate } = createEnvParser({ appName: "api-service" });

// Warn locally whenever the old key is still present
deprecate("database_url", "db__primary__url");

export const config = map((get) => ({
  db: {
    // Both keys work during the rollout window — ?? picks whichever is present.
    // Once everything is on DB__PRIMARY__URL, delete the fallback.
    url: get("db.primary.url") ?? get("database_url"),
  },
}));
```

While the old key is still present locally, you'll see:

```
WARN [env-parser:api-service] "database_url" is deprecated — migrate to "db__primary__url"
```

Nothing logs in `dev`, `qa`, or `prod`.

### Enforcing required keys

`get()` returns `undefined` for missing keys — the app decides what's required.

```ts
export const config = map((get) => {
  const dbUrl = get("database_url");
  if (!dbUrl) throw new Error("DATABASE_URL is required");

  return {
    db: { url: dbUrl as string },
    port: get("port") ?? 3000, // optional — has a default
    featureFlag: get("feature__dark_mode") ?? false, // optional — off by default
  };
});
```

### Swapping dotenv for a custom loader

The loader is a strategy — swap it out to pull vars from anywhere without changing anything else.

```ts
import { createEnvParser, type EnvLoader } from "@magnite/env-parser";

class SSMLoader implements EnvLoader {
  load() {
    // resolve SSM params and return as a flat Record<string, string>
    return fetchedParams;
  }
}

const { map } = createEnvParser({
  appName: "my-service",
  loader: new SSMLoader(),
});
```

For tests, inject a plain object so you never touch `process.env` or the filesystem:

```ts
import { createEnvParser } from "@magnite/env-parser";

const { map } = createEnvParser({
  appName: "test",
  loader: {
    load: () => ({
      DATABASE_URL: "postgres://localhost/test",
      PORT: "4000",
    }),
  },
});
```

## Debug mode

Set `DEBUG=true` (any casing: `"true"`, `"1"`, `"yes"`) in your local `.env` or shell:

```bash
DEBUG=true pnpm dev
```

When active and running locally, you'll see:

- Which keys were loaded at startup and how many
- Which `get()` calls returned `undefined`
- Which deprecated keys are still present

**Values are never logged** — only key names. Debug output is completely suppressed in any deployed environment (`dev`, `qa`, `prod` as resolved by `service-registry`).

## API

### `createEnvParser(options)`

| Option        | Type        | Default        | Description                                                    |
| ------------- | ----------- | -------------- | -------------------------------------------------------------- |
| `appName`     | `string`    | required       | Display name for debug output. Use your `package.json` `name`. |
| `loader`      | `EnvLoader` | `DotenvLoader` | Strategy for loading raw env vars.                             |
| `parseValues` | `boolean`   | `true`         | Coerce `"true"`/`"false"`/numeric strings to native types.     |

Returns an `EnvParser` with:

- **`.get(key)`** — look up any key using dot syntax, double underscores, single underscores, or any casing. Returns `undefined` and warns locally if the key doesn't exist. Returns a primitive or a nested object.
- **`.map(fn)`** — receives `get` and returns whatever shape you build. The right place to define your app config, enforce required keys, and handle rename fallbacks.
- **`.deprecate(oldKey, newKey)`** — logs a local warning if `oldKey` is still present. No-ops in deployed environments.
- **`.env`** — the raw parsed `EnvObject`. Prefer `get()` for individual lookups.

### `DotenvLoader`

The default loader. Calls `dotenv/config` once to read `.env` into `process.env`, then returns `process.env`. Exported so you can reference or extend it if needed.
