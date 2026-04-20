# Contributing

Thanks for your interest. This project has a deliberately small scope — please read the **Non-goals** section in the [README](./README.md) before filing features.

## Setup

```bash
npm install
npm run build
npm run test
```

## Development flow

1. Fork and branch from `main`.
2. For user-visible changes, add a changeset: `npx changeset`.
3. Before opening a PR, ensure all of the following pass:
   ```bash
   npm run lint
   npm run typecheck
   npm run test
   npm run size
   ```
4. Keep PRs focused on one thing. Discuss large changes in an issue first.

## Adding a validator

1. Implement `src/validators/<name>.ts` using `makeValidator` from `validators/base.ts`.
2. Export it from `src/validators/index.ts` and `src/index.ts`.
3. Add tests in `test/validators/<name>.test.ts` covering every error code it can emit.
4. Document the validator in the README table and, if it introduces a new error code, note it under **Errors and formatting**.
5. Add a changeset.

## Code style

- Prettier formats on save/commit; do not hand-format.
- Named exports only — no default exports.
- Prefer one function per file for the public surface.
- No runtime dependencies. Ever.

## Testing

- Add a test for every bug fix so it cannot regress.
- Prefer fixtures under `test/fixtures/` over inline strings when inputs grow.

## Reviews

PRs are reviewed in batches. If yours has not been looked at in two weeks, feel free to bump the thread.

## Non-goals

See the **Non-goals** section in the README. Feature requests matching any of those items will be declined.
