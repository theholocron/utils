# Decisions

Architectural Decision Records live here. Each file captures one architectural
decision, the options that were considered, and the rationale for the choice made.

## Creating a new decision

Copy the template and number it sequentially:

```sh
cp docs/wiki/decisions/template.md docs/wiki/decisions/000N-short-title.md
```

`madr` has no CLI — creation is manual. Frontmatter is validated in CI
via `scripts/validate-adrs.mjs` (runs as part of the Lint workflow).

## Status values

| Status       | Meaning                                            |
| ------------ | -------------------------------------------------- |
| `proposed`   | Under discussion — not yet accepted                |
| `accepted`   | In effect                                          |
| `rejected`   | Considered and declined                            |
| `deprecated` | Was accepted; no longer relevant                   |
| `superseded` | Replaced by a later decision (link in frontmatter) |

## Index

| ID  | Title | Status |
| --- | ----- | ------ |
