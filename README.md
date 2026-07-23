# `theholocron/utils`

<!-- holocron:description -->

Small utilities.

<!-- /holocron:description -->

A pnpm workspace monorepo of independently published utility packages.

## Packages

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

## Installation

```bash
pnpm add @theholocron/<name>-utils
```

## Development

```bash
pnpm build      # compile all packages
pnpm test       # run tests
pnpm typecheck  # type-check all packages
pnpm lint       # lint all packages
```

## Documentation

Check out [The Holocron Archive](https://docs.theholocron.dev/projects/utils/) for more information.
