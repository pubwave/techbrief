# TechBrief

The command that runs TechBrief — your personal reader for global tech news and
indie‑dev writing, with AI summaries and translation.

## Install

You need [Node.js 20 or newer](https://nodejs.org/).

```bash
npm install -g @pubwave/techbrief
```

## Start it

```bash
techbrief
```

On the first run, a short setup guide asks for:

- the language you want to read in
- whether to use a local AI (Ollama) or a cloud one (OpenAI, Anthropic,
  OpenRouter)

Then TechBrief starts up and opens the reader in your browser. Run `techbrief`
again any time to open it.

## Commands

| Command | What it does |
| --- | --- |
| `techbrief` | Start everything and open the reader |
| `techbrief setup` | Change your language or AI settings |
| `techbrief sync` | Fetch the latest articles now |
| `techbrief source list` | See where articles come from |
| `techbrief doctor` | Check that everything is set up correctly |
| `techbrief mobile run ios` | Install and open the app on your iPhone |
| `techbrief mobile run android` | Install and open the app on your Android |

Add `--help` to any command to see its options, e.g. `techbrief sync --help`.

## Reading on your phone

Connect your phone to the same Wi‑Fi as your computer, then:

```bash
techbrief mobile run ios       # or: android
```

The app installs and points at the TechBrief running on your computer.

## Notes

- Everything runs on your own computer; the web reader is at
  `http://127.0.0.1:9540`.
- Start without opening the browser with `techbrief --no-open`.
