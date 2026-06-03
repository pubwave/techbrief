# TechBrief

A multilingual reader for tech news and indie‑dev writing — every article gets a
short summary, and AI translates it into your language.

TechBrief gathers articles from Hacker News, Dev.to, Hashnode and RSS feeds and
gives each one a short summary. Pick your reading language: anything not already
in it is translated by AI (reading in English needs no AI at all). You read it
all in a clean web page or on your phone.

<img src="https://raw.githubusercontent.com/pubwave/techbrief/main/assets/home/web-reader.png" alt="The TechBrief web reader" width="600">

## Get started

You need [Node.js 20 or newer](https://nodejs.org/).

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

<img src="https://raw.githubusercontent.com/pubwave/techbrief/main/assets/home/cli-setup.png" alt="First-run setup guide" width="600">

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

<img src="https://raw.githubusercontent.com/pubwave/techbrief/main/assets/home/mobile-app.png" alt="The TechBrief mobile app" width="600">

Once it's installed, just open the app and start reading.

## Everyday commands

| Command | What it does |
| --- | --- |
| `techbrief` | Start everything and open the reader |
| `techbrief setup` | Change your language or AI settings |
| `techbrief sync` | Fetch the latest articles now |
| `techbrief source list` | See where articles come from |
| `techbrief doctor` | Check that everything is set up correctly |

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
