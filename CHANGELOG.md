# Changelog

All notable changes to this project are documented here. This project uses [Changesets](https://github.com/changesets/changesets) for automated version management.

## 0.1.0 — Unreleased

### Added
- `safeEnvoy` returning a discriminated `{ ok, data } | { ok, error }` union instead of throwing.
- `pickSchema`, `extendSchema`, `partialSchema` schema composition helpers.
- `strict: true` option on `envoy()` that emits `UNKNOWN_KEY` issues for source keys not in the schema, with a Levenshtein-based "Did you mean…" suggestion.
- New validators: `bigint`, `date`, `duration`, `base64`, `regex`.
- `.transform(fn)`, `.refine(predicate, message?)`, and `.describe(text)` on every validator.
- `generateExample(schema, options?)` that renders a `.env.example` file with descriptions as comments and `<REDACTED>` placeholders for secrets.
- Dual ESM + CJS build with a consolidated `exports` map; `unpkg` and `jsdelivr` CDN entry points.
- Property-based tests using `fast-check` for `num`, `host`, and `email` validators.

### Changed
- `num()` parsing now follows the JSON spec (rejects trailing characters, hex, and whitespace) instead of `Number()` coercion.
- `host()` uses a hand-rolled RFC-3986 IPv6 matcher (zone IDs and IPv4-mapped suffixes supported) and rejects IPv4-shaped strings with out-of-range octets.
- `csv({ allowEmpty })` replaces the old `skipEmpty` boolean with a `"skip" | "keep" | false` union.
- Non-string environment values (e.g. Cloudflare Workers bindings) emit `INVALID_TYPE` instead of being silently coerced.
- Sensitive validators never leak the raw value: `meta` is dropped on sensitive issues, and any `Received: …` payload in the message is replaced with `[REDACTED]`.
- `mask()` now walks one level into nested objects and arrays for sensitive keys.
- Sensitivity metadata is attached via a non-configurable Symbol property that survives `{ ...env }` spread.
- Schema iteration ignores unsafe keys (`__proto__`, `prototype`, `constructor`) to prevent prototype pollution.
- `formatErrors` gained a `{ color?: boolean }` option (default off) and renders `NO_SOURCE` as a standalone header.

### Fixed
- `.default(value)` called after `.optional()` throws a `TypeError` at runtime (previously silently accepted).
- `Deno.env.toObject()` permission failures are caught and fall back cleanly.
- Empty-schema runs no longer crash on strict-mode iteration.
