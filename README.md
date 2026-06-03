# TechBrief

Read the world's tech news and indie‑dev writing in one place — with AI
summaries and translation into your language.

TechBrief gathers articles from sources like Hacker News, Dev.to, Hashnode and
RSS feeds, then uses AI to give each article a short summary and translate it
into the language you choose. You read it all in a clean web page or on your
phone.

![The TechBrief web reader](https://raw.githubusercontent.com/pubwave/techbrief/main/assets/home/web-reader.png)

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

![First‑run setup guide](https://raw.githubusercontent.com/pubwave/techbrief/main/assets/home/cli-setup.png)

That's it.

## Choosing your AI

During setup you pick how summaries and translation are made:

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

![The TechBrief mobile app](https://raw.githubusercontent.com/pubwave/techbrief/main/assets/home/mobile-app.png)

This installs the app and points it at the TechBrief running on your computer.

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
npm run dev:server   # API on http://127.0.0.1:4310
npm run dev:web      # web reader
```

More detail lives in each package's folder under `apps/` and `packages/`.
