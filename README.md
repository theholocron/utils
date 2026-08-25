# `theholocron/utils`

<!-- holocron:description -->

Small utilities.

<!-- /holocron:description -->

## Packages

<!-- holocron:packages -->

| Package                                                      | Description                                             |
| ------------------------------------------------------------ | ------------------------------------------------------- |
| [`@theholocron/array-utils`](./packages/array-utils)         | Array conversion and manipulation                       |
| [`@theholocron/date-time-utils`](./packages/date-time-utils) | Date and time utilities                                 |
| [`@theholocron/env-utils`](./packages/env-utils)             | Runtime environment detection and typed env-var parsing |
| [`@theholocron/location-utils`](./packages/location-utils)   | Browser geolocation wrapper                             |
| [`@theholocron/misc-utils`](./packages/misc-utils)           | Miscellaneous utilities                                 |
| [`@theholocron/storage-utils`](./packages/storage-utils)     | Session storage wrapper                                 |
| [`@theholocron/string-utils`](./packages/string-utils)       | String casing, casting, and numbering                   |
| [`@theholocron/uri-utils`](./packages/uri-utils)             | URL search param utilities                              |

<!-- /holocron:packages -->

## Development

<!-- holocron:development -->

This repo uses [pnpm workspaces](https://pnpm.io/workspaces) and [Turbo](https://turbo.build).

```bash
pnpm install       # install all deps
pnpm build         # compile all packages
pnpm test          # run tests
pnpm typecheck     # type-check all packages
pnpm lint          # lint all packages
```

<!-- /holocron:development -->

## Releases

<!-- holocron:releases -->

Releases are automated via [semantic-release](https://semantic-release.gitbook.io) on push to `main`. All packages are versioned and published in lockstep. See [CHANGELOG.md](CHANGELOG.md) for the release history.

<!-- /holocron:releases -->
