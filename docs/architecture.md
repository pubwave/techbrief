# Architecture

## Principles

1. Keep source adapters, conversion, scheduling, and CLI concerns separate.
2. Keep files small enough to stay navigable.
3. Prefer shared schemas over implicit JSON contracts.
4. Keep the first version public-content-only and login-free.

## Packages

- `packages/shared`: default config, language list, source definitions, tiptap document types
- `packages/ingest`: source registry and custom source validation
- `packages/converter`: standalone converter that outputs `bodyTiptapJson`
- `packages/cli`: Ink-based product CLI shell

## Apps

- `apps/server`: JSON API shell exposing config, languages, sources, and schedule
- `apps/web`: React 19 front-end shell
- `apps/mobile`: Flutter shell
