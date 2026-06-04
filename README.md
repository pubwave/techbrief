# TechBrief

A multilingual reader for tech news and indie‑dev writing — every article gets a
short summary, and AI translates it into your language.

TechBrief gathers articles from Hacker News, Dev.to, Hashnode and RSS feeds and
gives each one a short summary. Pick your reading language: anything not already
in it is translated by AI (reading in English needs no AI at all). Read it all
in a clean web page or on your phone.

<img src="https://raw.githubusercontent.com/pubwave/techbrief/main/assets/home/web-reader.png" alt="The TechBrief web reader" width="900">

## Get started

Requires [Node.js 20 or newer](https://nodejs.org/).

1. Install:

   ```bash
   npm install -g @pubwave/techbrief
   ```

2. Start it:

   ```bash
   techbrief
   ```

The first time you run it, a short setup guide asks a few questions (your
language, and which AI to use). After that, TechBrief starts up and opens the
reader in your browser automatically.

<img src="https://raw.githubusercontent.com/pubwave/techbrief/main/assets/home/cli-setup.png" alt="First-run setup guide" width="900">

That's it.

## Choosing your AI

Translation is done by AI (summaries are generated locally without it). During
setup you pick which AI to use:

- **Local** — runs on your own machine with [Ollama](https://ollama.com/). Free,
  private, no API key.
- **Cloud** — uses a provider you already have a key for: OpenAI, Anthropic, or
  OpenRouter.

You can change this any time by running the setup again.

## Reading on your phone

TechBrief has a mobile app (iOS and Android). With your phone connected to the
same Wi‑Fi as your computer:

```bash
techbrief mobile run ios       # or: android
```

<img src="https://raw.githubusercontent.com/pubwave/techbrief/main/assets/home/mobile-app.png" alt="The TechBrief mobile app" width="900">

Once it's installed, just open the app and start reading.

## Commands

Run `techbrief help` to see them all. The most common ones:

| Command | What it does |
| --- | --- |
| `techbrief` | Start everything and open the reader |
| `techbrief launch` | Same as above — launch the runtime |
| `techbrief status` | Show what's running (API, web, scheduler) |
| `techbrief down` | Stop TechBrief (shuts the background services down) |
| `techbrief logs` | Show the background service logs |
| `techbrief sync` | Fetch the latest articles now |
| `techbrief setup` | Change your language or AI settings |
| `techbrief doctor` | Check that everything is set up correctly |
| `techbrief help` | List every command |
| `techbrief version` | Show the CLI version |

After running TechBrief, the API, web reader, and scheduler keep running in the
background so syncing continues. Use `techbrief down` to stop them.

**AI model (local / Ollama)**

| Command | What it does |
| --- | --- |
| `techbrief model local list` | List installed local models |
| `techbrief model local install` | Install a local model with Ollama |
| `techbrief model local use` | Set a local model as the configured one |
| `techbrief model local uninstall` | Remove a local model from Ollama |

**Mobile**

| Command | What it does |
| --- | --- |
| `techbrief mobile run ios` | Build and run the app on iOS |
| `techbrief mobile run android` | Build and run the app on Android |
| `techbrief mobile install` | Check Flutter and install the app on a connected phone |
| `techbrief mobile devices` | List connected Flutter devices |

**Schedule & config**

| Command | What it does |
| --- | --- |
| `techbrief schedule get` | Show the sync schedule |
| `techbrief schedule set` | Update the sync schedule |
| `techbrief config get` | Show the current configuration |
| `techbrief config set` | Update configuration (language, model, days…) |
| `techbrief init` | Initialize config non-interactively (flag-driven) |

**Setup & maintenance**

| Command | What it does |
| --- | --- |
| `techbrief install` | Install npm dependencies and the Flutter mobile project |
| `techbrief build` | Build the web bundle and run Flutter static checks |
| `techbrief up` | Hint for how to start the runtime |

**Dockerized web stack**

| Command | What it does |
| --- | --- |
| `techbrief web up` | Bring up the dockerized web stack |
| `techbrief web down` | Tear down the dockerized web stack |
| `techbrief web logs` | Show dockerized web stack logs |

**Sources**

| Command | What it does |
| --- | --- |
| `techbrief source list` | List configured feed sources |
| `techbrief source add` | Add a custom feed source |
| `techbrief source validate` | Validate a feed source URL |
| `techbrief source enable` | Enable a feed source |
| `techbrief source disable` | Disable a feed source |

## Update & uninstall

Update to the latest version:

```bash
npm install -g @pubwave/techbrief@latest
```

Uninstall:

```bash
npm uninstall -g @pubwave/techbrief
```

This removes the command but keeps your settings and saved articles in
`~/.techbrief`. To wipe those too:

```bash
rm -rf ~/.techbrief
```

## Good to know

- TechBrief runs entirely on your own computer. Your reading stays with you.
- The app talks to your computer over your local Wi‑Fi, so keep both on the same
  network.

## For developers

This is an npm‑workspaces monorepo (CLI, web, mobile, server, and shared
packages). To run it from source:

```bash
npm install
npm run build
npm run dev:server   # API server
npm run dev:web      # web reader (Vite dev server)
```

More detail lives in each package's folder under `apps/` and `packages/`.

## Built with

TechBrief is built on two sibling Pubwave projects:

- [@pubwave/cli](https://github.com/pubwave/pubwave-cli) — the composable CLI toolkit powering the setup wizard and mobile install flow.
- [@pubwave/editor](https://github.com/pubwave/pubwave-editor) — the rich-text editor that renders articles in the web and mobile readers.
