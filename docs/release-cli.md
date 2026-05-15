# Release CLI

## Goal

Publish the standalone `techbrief` npm package so users can install it globally and run:

```bash
npm install -g techbrief
techbrief
```

## Package Shape

- Published package: `packages/cli`
- npm package name: `techbrief`
- Published files:
  - `dist/index.js`
  - `dist/bin/serve-web.js`
  - `README.md`
  - `package.json`

The CLI bundle includes internal TechBrief workspace logic and keeps external npm dependencies as normal package dependencies.

## Preflight

Run:

```bash
npm run check
npm run build
npm run pack:cli:dry
```

Optional local tarball build:

```bash
npm run pack:cli
```

Default tarball output path:

```text
/tmp/techbrief-pack/techbrief-0.1.0.tgz
```

## Publish

From `packages/cli`:

```bash
npm publish --access public
```

Or from the workspace root:

```bash
npm publish ./packages/cli --access public
```

## Post-publish Smoke Test

On a clean machine:

```bash
npm install -g techbrief
techbrief doctor
techbrief --no-open --no-mobile
techbrief status
techbrief down
```

Expected first-run behavior:

- `techbrief` opens an Ink guide when `.techbrief/config.json` does not exist yet.
- The guide collects language, model source, provider/model, and freshness window.
- Local model mode attempts to install the selected Ollama model automatically before launch.

## Environment Notes

- `techbrief` starts local API and web processes in the background and stores runtime files under `.techbrief/runtime`.
- Mobile install requires local Flutter tooling and a connected supported device.
- In restricted sandboxes, local port binding may fail with `listen EPERM`; this is an environment limitation, not a CLI packaging issue.
