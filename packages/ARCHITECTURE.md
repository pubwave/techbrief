# Packages Architecture

This workspace is organized as a layered product stack.

## Package roles

- `packages/shared`
  Shared domain contracts, defaults, content/source/config models, and language metadata.
  Do not put IO, CLI rendering, or external service orchestration here.

- `packages/ingest`
  Source fetching, parsing, validation, and sync adapters.
  Keep protocol-specific adapters under `src/adapters/*` and keep registry/rule wiring separate from fetch logic.

- `packages/ai`
  Provider clients and AI pipeline steps.
  Keep provider-specific transport details inside `src/providers/*` and generic enrichment flow inside `src/pipeline/*`.

- `packages/converter`
  Pure content transformation utilities.
  Keep this package stateless and free of runtime/service dependencies.

- `packages/pipeline`
  Cross-package enrichment orchestration.
  This is the place for end-to-end article processing flow, not provider implementation details.

- `packages/runtime`
  Runtime workspace, persisted config/state, and application store access.
  Keep filesystem/store access here so higher layers can stay focused on product flow.

- `packages/cli`
  User-facing command flow, terminal UI, setup/install orchestration, and local machine integration.
  Keep CLI entry wiring in root `src/pubwave-*.ts` files and `src/index.ts`, command entrypoints under `src/commands`, feature-owned workflow code under `src/features/*`, and shared adapters/helpers under `src/shared` and `src/components`.

## CLI module boundaries

Inside `packages/cli`, prefer these boundaries:

- root `src/index.ts` / `src/pubwave-*.ts`
  Top-level CLI entry wiring only.
  Keep Pubwave CLI integration, launch option parsing, custom setup steps, stages, runtime hooks, and command registration here.

- `src/commands`
  Thin command entry files grouped by command domain.
  Prefer `src/commands/<domain>/index.ts` and only split extra files when a command family has clearly separate concerns.

- `src/features/setup`
  Setup wizard rendering, input handling, launch-flow orchestration, progress state, and setup-specific view helpers.
  Prefer:
  - `components/` for render-only setup views
  - `hooks/` for input/state orchestration near the wizard UI
  - `flow/` for setup launch workflows
  - `state/` for state shaping and selection helpers
  - `presentation/` for output/progress formatting helpers
  - root files like `types.ts`, `helpers.ts`, `layout.ts` only when shared across the feature

- `src/components`
  Cross-feature UI primitives only.
  Do not place setup-specific workflow files here anymore.

- `src/shared`
  Cross-feature helpers and adapters grouped by capability.
  Prefer:
  - `browser/` for browser and shell-open helpers
  - `i18n/wizard/` for locale catalogs, choice builders, and message lookup
  - `models/` for shared model catalogs and local-model support
  - `paths/` for workspace/runtime path resolution and command runners
  - `process/` for detached-process management and command output helpers
  - `runtime/` for shared runtime orchestration that is not owned by one feature
  - `terminal/` for terminal-screen helpers
  - `ui/` for cross-feature line/section builders

## Current CLI sub-areas

- Setup flow:
  `src/features/setup/components/*`
  `src/features/setup/hooks/*`
  `src/features/setup/flow/*`
  `src/features/setup/state/*`
  `src/features/setup/presentation/*`
  `src/features/setup/{types,helpers,layout}.ts`

- Mobile install/runtime integration:
  handled by `@pubwave/cli` through the `features.mobile.flutter` configuration in TechBrief's CLI entrypoint.

- App and command wiring:
  `src/index.ts`
  `src/pubwave-*.ts`
  `src/commands/core/*`
  `src/commands/config/*`
  `src/commands/source/*`
  `src/commands/schedule/*`

- Shared CLI primitives:
  `src/components/*`
  `src/shared/*`

## Refactor rules for future changes

- Do not add new user-facing CLI text directly in command or workflow files.
- Do not append new error classification logic to a view file.
- Do not mix terminal rendering with machine/process orchestration in the same module.
- Do not add new setup-specific files back under `src/components`.
- Do not reintroduce TechBrief-owned mobile install workflows; use `@pubwave/cli` mobile features.
- Do not reintroduce a flat `src/lib` catch-all directory.
- Do not keep adding new command families as flat `src/commands/*.ts` files.
- If a workflow file grows because of repeated state-shaping logic, extract state builders.
- If a service file grows because of repeated parsing/detection/error-mapping logic, extract focused helper modules.

## Recent structure improvements

- TechBrief-owned mobile install workflow removed; mobile setup/install now belongs to `@pubwave/cli`
- Unused legacy React command components removed; active CLI commands use line/section builders from `src/shared/ui`
- Shared CLI helpers moved from flat `src/lib` into `src/shared/*` capability folders
