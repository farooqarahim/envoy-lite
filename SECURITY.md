# Security Policy

## Supported versions

Security patches ship for the latest minor of the latest two majors. Older lines receive fixes only for high-severity issues, at the maintainer's discretion.

## Reporting a vulnerability

**Do not open a public GitHub issue for security problems.**

Use GitHub's private advisory flow:
https://github.com/farooqarahim/envoy-lite/security/advisories/new

Or email: farooqarahim@gmail.com

## Response SLA

- Initial acknowledgement: within 72 hours
- Triage and severity assessment: within 7 days
- Fix for critical severity: within 14 days
- Fix for high severity: within 30 days
- Coordinated disclosure: 90 days from first report, or on fix release, whichever is sooner

This project is volunteer-maintained. We will communicate openly if a deadline slips.

## Scope

In scope:

- Crashes, hangs, or denial-of-service triggered by a malicious `source` value.
- Information disclosure — any path where a field declared `secret()` could appear in `EnvoyError.message`, `formatErrors()` output, or `mask()` output.
- Type-safety holes where the schema validates but the runtime result crashes code that trusts the inferred types.
- Prototype pollution via schema keys or source keys.

Out of scope:

- The permissiveness of `email()` (documented as best-effort, not RFC-5322).
- Behaviour when a caller passes an invalid value to `.default()` — this is a programming error, not a validation issue (see README, *Defaults are not re-validated*).
- Any misuse of the library that the README documents against.

## Hardening guarantees

- Zero runtime dependencies — no transitive supply-chain surface.
- Schema iteration skips unsafe keys (`__proto__`, `prototype`, `constructor`).
- Sensitive issues drop `meta` and redact `Received:` payloads before they ever reach `EnvoyError.message`.
- Sensitivity metadata is attached via a non-configurable `Symbol` so it survives `{ ...env }` spread.
