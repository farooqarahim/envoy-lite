# envoy-lite

**Tiny env loader and schema validator.** Zero dependencies. Edge-first.

[![npm](https://img.shields.io/npm/v/envoy-lite.svg)](https://www.npmjs.com/package/envoy-lite)
[![downloads](https://img.shields.io/npm/dm/envoy-lite.svg)](https://www.npmjs.com/package/envoy-lite)
[![minzip](https://img.shields.io/bundlephobia/minzip/envoy-lite.svg?label=minzip)](https://bundlephobia.com/package/envoy-lite)
[![install size](https://packagephobia.com/badge?p=envoy-lite)](https://packagephobia.com/result?p=envoy-lite)
[![types](https://img.shields.io/npm/types/envoy-lite.svg)](https://www.npmjs.com/package/envoy-lite)
[![zero deps](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](https://www.npmjs.com/package/envoy-lite?activeTab=dependencies)
[![CI](https://img.shields.io/github/actions/workflow/status/farooqarahim/envoy-lite/ci.yml?label=CI)](https://github.com/farooqarahim/envoy-lite/actions)
[![license](https://img.shields.io/npm/l/envoy-lite.svg)](./LICENSE)

## Why

Most environment-variable bugs are the same four: a missing value, a wrong type, a renamed field, or a leaked secret. `envoy-lite` fixes all four at boot, once, with no runtime cost and no dependencies. It validates `process.env` (or any `{ key: string }` map) against a schema, reports every failure at once, and returns a fully typed frozen object.

## Install

```bash
npm install envoy-lite
```

## Quick example

```ts
import { envoy, str, num, port, url, enum_, bool, secret } from "envoy-lite";

export const env = envoy({
  DATABASE_URL: url({ protocols: ["postgres"] }),
  PORT: port(),
  NODE_ENV: enum_(["development", "production", "test"] as const),
  LOG_LEVEL: str().default("info"),
  DEBUG: bool().default(false),
  API_KEY: secret()
});
```

If anything is missing or wrong, the process exits at boot with every issue listed.

## API

```ts
envoy<S>(schema: S, options?: EnvoyOptions): Readonly<Infer<S>>;
```

- `schema` — a `Record<string, Validator<unknown>>`.
- `options.source` — optional `{ [key: string]: string | undefined }`. Defaults to `process.env` / `Deno.env.toObject()`.
- `options.context` — optional label appended to error messages.
- `options.strict` — reject unknown source keys with `UNKNOWN_KEY`.

## Validators

| Factory      | Type               | Notes                                                           |
| ------------ | ------------------ | --------------------------------------------------------------- |
| `str()`      | `string`           | `min`, `max`, `pattern`, `trim`                                 |
| `num()`      | `number`           | `min`, `max`, `integer`; rejects `0x`, `0o`, `0b`, `1_000`, NaN |
| `bool()`     | `boolean`          | customisable `truthy` / `falsy`                                 |
| `enum_()`    | `"a" \| "b"`       | exact, case-sensitive                                           |
| `url()`      | `string`           | `protocols`                                                     |
| `port()`     | `number`           | 1–65535, integer                                                |
| `email()`    | `string`           | permissive regex (not RFC-5322)                                 |
| `host()`     | `string`           | IPv4, IPv6 (incl. zone-id, IPv4-mapped), hostname               |
| `json()`     | `T`                | optional `validate` type guard                                  |
| `csv()`      | `T[]`              | composes any validator; `allowEmpty: "skip" \| "keep" \| false` |
| `bigint()`   | `bigint`           | `min`, `max`                                                    |
| `date()`     | `Date`             | ISO-8601; rejects `Invalid Date`                                |
| `duration()` | `number` (ms)      | parses `"500ms"`, `"30s"`, `"2h"`, `"7d"`                       |
| `base64()`   | `Uint8Array`       | standard or url-safe alphabet                                   |
| `regex()`    | `RegExpMatchArray` | applies a `RegExp` and returns the match                       |
| `secret()`   | `string`           | marks value as sensitive                                        |

Every validator exposes the full fluent surface:

- `.optional()` — returns `T | undefined`
- `.default(v)` — returns `T` (cannot be chained after `.optional()`; throws `TypeError` at runtime)
- `.transform(fn)` — post-parse mapping
- `.refine(predicate, message?)` — custom predicate emitting `REFINE_FAILED`
- `.describe(text)` — attaches a description used by `generateExample()` and error formatters

## Type inference

```ts
import { envoy, type Infer, str, num } from "envoy-lite";

const schema = { NAME: str(), PORT: num() };
type Env = Infer<typeof schema>; // { NAME: string; PORT: number }

export const env = envoy(schema);
```

## Safe mode (no throw)

```ts
import { safeEnvoy, str } from "envoy-lite";

const result = safeEnvoy({ API_KEY: str() });
if (!result.ok) {
  // result.error is an EnvoyError with issues.
}
```

## Strict mode

Set `strict: true` to reject unknown source keys. Typos get a "Did you mean…" suggestion.

```ts
envoy({ DATABASE_URL: url() }, { strict: true });
// Throws UNKNOWN_KEY for DATABSE_URL with suggestion: "DATABASE_URL"
```

## Schema composition

```ts
import { pickSchema, extendSchema, partialSchema } from "envoy-lite";

const base = { A: str(), B: num() };
const withLog = extendSchema(base, { LOG_LEVEL: str().default("info") });
const justA = pickSchema(base, ["A"] as const);
const allOptional = partialSchema(base);
```

## `.env.example` generation

```ts
import { generateExample, str, num, secret } from "envoy-lite";

const out = generateExample(
  {
    PORT: num().describe("HTTP listen port"),
    API_KEY: secret()
  },
  { header: "Example config" }
);
// # Example config
//
// # HTTP listen port
// PORT=<REQUIRED>
//
// API_KEY=<REDACTED>
```

## Cloudflare Workers / edge runtimes

Pass the binding object as `source`:

```ts
export default {
  fetch(_req: Request, env: Env) {
    const cfg = envoy({ API_KEY: str() }, { source: env });
    // ...
  }
};
```

Non-string bindings emit `INVALID_TYPE` rather than being silently coerced.

## Async secret loader

`envoy()` is synchronous by design. To load secrets asynchronously (Vault, SSM, etc.), fetch first and pass the result as `source`:

```ts
const secrets = await fetchSecrets();
export const env = envoy(schema, { source: { ...process.env, ...secrets } });
```

## Cross-field validation

Intentionally out of scope — run your own checks after `envoy()`. A typed frozen object makes this trivial:

```ts
const env = envoy(schema);
if (env.NODE_ENV === "production" && !env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required in production");
}
```

See the [`examples/`](./examples) directory for runnable snippets.

## Errors and formatting

`envoy()` throws a single `EnvoyError` containing all issues:

```ts
import { envoy, formatErrors, EnvoyError } from "envoy-lite";

try {
  const env = envoy(schema);
} catch (err) {
  if (err instanceof EnvoyError) {
    console.error(formatErrors(err));
    process.exit(1);
  }
  throw err;
}
```

Output:

```
3 environment variable(s) failed validation.

  x DATABASE_URL  MISSING        Required value not set.
  x PORT          OUT_OF_RANGE   Expected number <= 65535. Received: 70000.
  x API_KEY       MISSING        Required value not set.
```

## Secrets

Fields declared with `secret()` are marked sensitive. Their values never appear in `EnvoyError.message`, `formatErrors()` output, or the `received` metadata. Use `mask()` for safe logging:

```ts
import { mask } from "envoy-lite";
console.log(mask(env)); // { API_KEY: "[REDACTED]", ... }
```

## Runtime support

| Runtime              | Supported                            |
| -------------------- | ------------------------------------ |
| Node 18+             | yes                                  |
| Bun 1+               | yes                                  |
| Deno 1.40+           | yes (needs `--allow-env`)            |
| Cloudflare Workers   | yes (pass binding `env` as `source`) |
| Vercel Edge          | yes                                  |
| Browsers             | no (out of scope)                    |

## Defaults are not re-validated

A value supplied to `.default(v)` is returned as-is without being passed through the validator. This keeps the implementation small. If you pass an invalid default, that is a programming error, not a validation error.

## Non-goals

- No browser support.
- No `.env` file parsing. Use Node 20+'s `--env-file`, Bun's auto-load, or `dotenv` manually.
- No secret manager integration (Vault, SSM, SM, Doppler).
- No remote config or feature flags.
- No framework plugins.
- No async validators.
- No cross-field validation.
- No coercion beyond what each validator documents.
- No watch mode.
- No CLI.
- No runtime dependencies.

## Comparison

| Library       | Validation         | TS inference | Zero deps      | Edge    | Group errors | Secrets aware |
| ------------- | ------------------ | ------------ | -------------- | ------- | ------------ | ------------- |
| envoy-lite    | yes                | yes          | yes            | yes     | yes          | yes           |
| dotenv        | no                 | no           | yes            | partial | n/a          | no            |
| dotenv-safe   | required-only      | no           | partial        | no      | partial      | no            |
| envalid       | yes                | partial      | no             | partial | partial      | no            |

## Security

npm's supply-chain scanners flag this package for **environment variable access**. That is its purpose — it reads the `source` you pass in (defaulting to `process.env` / `Deno.env.toObject()`) and validates it. For transparency:

- **Reads only.** Values are read from the `source` map, validated, and returned. Nothing is written back.
- **No network.** No `fetch`, no sockets, no telemetry, no analytics.
- **No filesystem.** No reads, no writes, no `.env` parsing.
- **No child processes.** No `exec`, no `spawn`.
- **Zero runtime dependencies.** No transitive supply-chain surface.
- **Secrets stay local.** `secret()` values are never included in `EnvoyError.message`, `formatErrors()` output, or `mask()` output.

See [SECURITY.md](./SECURITY.md) for the full policy, scope, and reporting flow.

## License

MIT.
