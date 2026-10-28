# Agent Instructions

Read `CONTEXT.md` before making code changes.

Follow existing project patterns. Prefer small, focused changes. Do not duplicate architecture or domain context here; keep `CONTEXT.md` as the source of truth.

Update `CONTEXT.md` only when a change makes its existing guidance materially incorrect or introduces a lasting architectural decision or support contract that future work needs to know. Routine bug fixes, internal refactors, optimizations, tests, and dependency bumps normally need no update. Keep implementation details in code and tests; do not use this file as a changelog.

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

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
