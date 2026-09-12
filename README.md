# `theholocron/utils`

<!-- holocron:description -->

Lightweight TypeScript utility packages for arrays, strings, dates, environment detection, and more.
<!-- /holocron:description -->

<!-- holocron:installation -->

## Installation

This repository is a workspace root — it is not published. See the
packages under [`packages/`](./packages) for the tools it ships.

<!-- /holocron:installation -->

## Packages

<!-- holocron:packages -->

| Package                        | Docs                                                 | npm                                                               |
| ------------------------------ | ---------------------------------------------------- | ----------------------------------------------------------------- |
| `@theholocron/array-utils`     | [Docs](https://docs.theholocron.dev/utils/array)     | [npm](https://www.npmjs.com/package/@theholocron/array-utils)     |
| `@theholocron/date-time-utils` | [Docs](https://docs.theholocron.dev/utils/date-time) | [npm](https://www.npmjs.com/package/@theholocron/date-time-utils) |
| `@theholocron/env-utils`       | [Docs](https://docs.theholocron.dev/utils/env)       | [npm](https://www.npmjs.com/package/@theholocron/env-utils)       |
| `@theholocron/location-utils`  | [Docs](https://docs.theholocron.dev/utils/location)  | [npm](https://www.npmjs.com/package/@theholocron/location-utils)  |
| `@theholocron/misc-utils`      | [Docs](https://docs.theholocron.dev/utils/misc)      | [npm](https://www.npmjs.com/package/@theholocron/misc-utils)      |
| `@theholocron/storage-utils`   | [Docs](https://docs.theholocron.dev/utils/storage)   | [npm](https://www.npmjs.com/package/@theholocron/storage-utils)   |
| `@theholocron/string-utils`    | [Docs](https://docs.theholocron.dev/utils/string)    | [npm](https://www.npmjs.com/package/@theholocron/string-utils)    |
| `@theholocron/uri-utils`       | [Docs](https://docs.theholocron.dev/utils/uri)       | [npm](https://www.npmjs.com/package/@theholocron/uri-utils)       |

<!-- /holocron:packages -->

## Development

<!-- holocron:development -->

| Script               | Command                   |
| -------------------- | ------------------------- |
| `pnpm build`         | `turbo run build`         |
| `pnpm lint`          | `holocron run lint`       |
| `pnpm test`          | `holocron run test`       |
| `pnpm test:coverage` | `turbo run test:coverage` |
| `pnpm typecheck`     | `holocron run typecheck`  |
| `pnpm audit`         | `knip`                    |

<!-- /holocron:development -->

## Releases

<!-- holocron:releases -->

Automated via [semantic-release](https://semantic-release.gitbook.io/semantic-release/).
See the [releases page](https://docs.theholocron.dev/utils/releases) and [CHANGELOG.md](./CHANGELOG.md).

<!-- /holocron:releases -->
