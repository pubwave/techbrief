# TechBrief

TechBrief is an open-source product for reading global tech news and indie developer writing with AI summaries and translation.

## Workspace

- `apps/server`: Node.js + TypeScript API layer
- `apps/web`: React 19 web client
- `apps/mobile`: Flutter mobile client
- `packages/shared`: shared config, types, default sources
- `packages/ingest`: source registry and source validation
- `packages/converter`: standalone content converter for `@pubwave/editor`
- `packages/cli`: Ink-based product CLI

## Current Status

This repository already includes a working first-pass product skeleton described in [plan.md](./plan.md):

- `Ink` CLI with `doctor`, `install`, `init`, `up`, `build`, `sync`, `config`, `source`, and `schedule` commands
- Default `techbrief` / `techbrief launch` flow that prepares a runtime workspace, starts the API, serves the built web app, opens the browser, and attempts mobile install when a supported device is connected
- Multi-path ingestion across `rss`, `html`, and `api` adapters with local article persistence under `.techbrief/`
- AI enrichment fallback pipeline and standalone content converter
- React 19 web reading surface with `@pubwave/editor` read-only detail rendering
- Flutter iOS/Android shell with article list, detail navigation, and local/API-backed reading data
- Node.js + TypeScript API routes for config, sources, schedules, feed list, feed detail, and sync

## Development

1. Install dependencies with `npm install`.
2. Run checks with `npm run check`.
3. Build the workspace with `npm run build`.

### Server

- Start the local API with `node apps/server/dist/index.js`.
- Default address: `http://127.0.0.1:4310`
- The server is intentionally open in the first version: no login, no auth, permissive CORS for local product setup.
- `GET /v1/models` now includes the selected model source, provider, model, and runtime availability information for `openai`, `anthropic`, `openrouter`, `ollama`, and `local`.
- `POST /v1/sync` runs the unified ingestion pipeline over default and custom sources.

### Web

- Start the web client with `npm run dev -w @techbrief/web`.
- Vite proxies `/v1/*` and `/health` to `http://127.0.0.1:4310` by default.
- Override the proxy target with `TECHBRIEF_API_PROXY=http://your-host:4310 npm run dev -w @techbrief/web`.
- Article detail uses `@pubwave/editor` in read-only mode against the shared `bodyTiptapJson` schema.

### Docker

- Environment variables for AI providers are documented in [.env.example](/Users/hihifreedom/Documents/work/pubwave/techbrief/.env.example).
- Start the Docker stack with `npm run docker:up`.
- Stop it with `npm run docker:down`.
- Inspect logs with `npm run docker:logs`.
- Compose entrypoint: [`infra/docker-compose.yml`](/Users/hihifreedom/Documents/work/pubwave/techbrief/infra/docker-compose.yml)

### Mobile

- Run static checks with `flutter analyze` in [`apps/mobile`](/Users/hihifreedom/Documents/work/pubwave/techbrief/apps/mobile).
- Launch with a local API using:
  - iOS Simulator: `flutter run --dart-define=TECHBRIEF_API_BASE_URL=http://127.0.0.1:4310`
  - Android Emulator: `flutter run --dart-define=TECHBRIEF_API_BASE_URL=http://10.0.2.2:4310`
- If no API base URL is provided, the app falls back to bundled mock articles.
- App name: `TechBrief`
- Bundle ID / applicationId: `com.pubwave.techbrief`
- `node packages/cli/dist/index.js mobile run android --api-base-url=http://10.0.2.2:4310`
- `node packages/cli/dist/index.js mobile run ios --api-base-url=http://127.0.0.1:4310`
- Mobile install flow does not require `git clone`. The CLI downloads the project archive directly, stages it in a temporary directory, runs Flutter there, and cleans it up afterward unless `--keep-temp` is passed.

### CLI

- Global install target: `npm install -g techbrief`
- Default one-command flow after install: `techbrief`
- First run opens an Ink setup guide for language, model source, provider/model selection, and freshness window
- `node packages/cli/dist/index.js`
- `node packages/cli/dist/index.js launch`
- `node packages/cli/dist/index.js setup`
- `node packages/cli/dist/index.js status`
- `node packages/cli/dist/index.js logs`
- `node packages/cli/dist/index.js down`
- `node packages/cli/dist/index.js doctor`
- `node packages/cli/dist/index.js init --language=ja --provider=openai --days=7`
- `node packages/cli/dist/index.js config get`
- `node packages/cli/dist/index.js source list`
- `node packages/cli/dist/index.js sync`
- `node packages/cli/dist/index.js web up`
- `node packages/cli/dist/index.js web down`
- `node packages/cli/dist/index.js web logs`

Default launch behavior:

- Reuses the local workspace during development, or downloads the project template into `.techbrief/runtime/workspace` when running as an installed CLI outside the repo.
- On first run, opens a guided setup flow and writes `.techbrief/config.json` before continuing.
- Starts the API and static web server in the background and keeps logs under `.techbrief/runtime/logs`.
- Opens the browser unless `--no-open` is passed.
- Tries mobile install only when a supported connected device is detected; otherwise it leaves web running and reports that mobile was skipped.
- `techbrief status` shows the local API/web runtime state.
- `techbrief logs` tails the latest local runtime logs.
- `techbrief down` stops the local API/web runtime.

Release packaging notes:

- Dry-run the publishable CLI tarball with `npm run pack:cli:dry`
- Build the real tarball with `npm run pack:cli`
- Release guide: [docs/release-cli.md](/Users/hihifreedom/Documents/work/pubwave/techbrief/docs/release-cli.md)

The CLI is designed for a normal local shell. In this sandbox, Flutter subcommands invoked from inside the Node CLI can hit write restrictions on the Flutter cache even though direct `flutter analyze` and `flutter test` work.

## Next Steps

1. Add more source-specific adapters beyond RSS and Atom.
2. Expand default source coverage for HTML-only providers and curated source packs.
3. Add production install flows for mobile device deployment from the CLI.
4. Replace local file persistence with a database-backed storage option for larger deployments.
