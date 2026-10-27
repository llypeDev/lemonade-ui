# Third-party notices

`@lemonade/ui` includes third-party material distributed under its own license.

## Phosphor Icons

- **What:** icon assets (SVG path data for 1,512 icons in 6 weights) and catalog metadata (names, tags, categories),
  vendored from [`@phosphor-icons/core`](https://github.com/phosphor-icons/core) at the version recorded in
  `vendor/phosphor/VERSION.json`.
- **Where:** `vendor/phosphor/` (raw SVGs and catalog), `src/phosphor/generated/` (React components generated from
  the SVGs) and the published `@lemonade/ui/phosphor` entry point.
- **Copyright:** © 2023 Phosphor Icons — <https://phosphoricons.com>
- **License:** MIT. The full license text ships with the icons in
  [`vendor/phosphor/LICENSE`](vendor/phosphor/LICENSE) and in the published package at `phosphor/LICENSE`.

The Lemonade explorer for these icons (`site/src/components/phosphor`) is an independent implementation; it does not
reuse code from the Phosphor website.
