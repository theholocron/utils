# `@magnite/environment`

Resolve and normalize the current runtime environment. No dependencies.

## Why this exists

`process.env.NODE_ENV` is inconsistent across tools — Vitest sets it to `"test"`, some frameworks use `"development"`, infrastructure teams use `"staging"`. This package normalizes all of that into four canonical values your app code can actually branch on.

## Installation

```bash
pnpm add @magnite/environment
```

## Usage

```ts
import { environment } from "@magnite/environment";

environment.get(); // "local" | "dev" | "qa" | "prod"
environment.isDeployed(); // true if qa or prod
```

No setup, no initialization. Reads `process.env` at call time.

## Environment resolution

`get()` checks these variables in order, falling back to the next if unset:

1. `ENVIRONMENT`
2. `ENV`
3. `NODE_ENV`
4. `DEFAULT_ENVIRONMENT` (`"prod"`)

The resolved value is normalized to one of the four canonical environments:

| Input                         | Canonical |
| ----------------------------- | --------- |
| `"local"`                     | `"local"` |
| `"dev"`, `"development"`      | `"dev"`   |
| `"qa"`, `"test"`, `"staging"` | `"qa"`    |
| `"prod"`, `"production"`      | `"prod"`  |

Unrecognized values fall back to `DEFAULT_ENVIRONMENT` and log a `console.warn`.

## API

### `environment.get()`

Returns the current canonical environment.

```ts
environment.get(); // → "local" | "dev" | "qa" | "prod"
```

### `environment.isDeployed()`

Returns `true` if the current environment is `"qa"` or `"prod"`.

```ts
if (environment.isDeployed()) {
  // running in qa or prod
}
```

### `environment.normalize(value)`

Normalizes an arbitrary string to a canonical environment, or `undefined` if unrecognized. Useful for validating environment strings from config files or CLI args.

```ts
environment.normalize("staging"); // → "qa"
environment.normalize("development"); // → "dev"
environment.normalize("unknown"); // → undefined
```

## Exports

```ts
import {
  environment, // { get, isDeployed, normalize }
  ENVIRONMENTS, // ["local", "dev", "qa", "prod"] as const
  DEPLOYED_ENVIRONMENTS, // Set<Environment> — { "qa", "prod" }
  DEFAULT_ENVIRONMENT, // "prod"
} from "@magnite/environment";

import type { Environment } from "@magnite/environment";
```

## Testing

Use `vi.stubEnv` to control the environment in tests — no mocking or dependency injection needed.

```ts
import { vi } from "vitest";
import { environment } from "@magnite/environment";

vi.stubEnv("ENVIRONMENT", "local");
environment.get(); // → "local"
environment.isDeployed(); // → false
```

Always call `vi.unstubAllEnvs()` in `beforeEach` to prevent env state leaking between tests. Vitest sets `NODE_ENV=test` by default (which normalizes to `"qa"`), so stub it explicitly if your test needs a clean slate:

```ts
beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv("NODE_ENV", "");
});
```
