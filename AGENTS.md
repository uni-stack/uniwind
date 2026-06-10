# Agent Instructions

Read `CONTEXT.md` before making code changes.

Follow existing project patterns. Prefer small, focused changes. Do not duplicate architecture or domain context here; keep `CONTEXT.md` as the source of truth.

Before changing public APIs, build/runtime contracts, supported platforms, or architecture, update `CONTEXT.md`.

## Checks

Use `bun` for repo commands.

Common checks:

- `bun run lint`
- `bun run check:typescript`
- `bun run test`
- `bun run format`

For package-specific work under `packages/uniwind`, prefer targeted package scripts when available:

- `bun run build`
- `bun run check:typescript`
- `bun run lint`
- `bun run circular:check`
- `bun run test:native`
- `bun run test:web`
- `bun run test:types`
- `bun run test:e2e`

Run relevant checks after changes when practical. Mention skipped checks in final response.
