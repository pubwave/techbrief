# TechBrief CLI

Install:

```bash
npm install -g techbrief
```

Run the default product flow:

```bash
techbrief
```

On the first run, TechBrief opens an Ink setup guide so the user can choose:

- default language
- model source: local or cloud
- AI provider when cloud mode is selected
- a single AI model used for summary, translation, and keywords
- freshness window

Useful commands:

- `techbrief setup`
- `techbrief launch`
- `techbrief doctor`
- `techbrief config get`
- `techbrief source list`
- `techbrief sync`
- `techbrief mobile run android`
- `techbrief mobile run ios`

Default launch behavior:

- Reuses the local monorepo during development, or downloads the TechBrief template into `.techbrief/runtime/workspace` when installed as a standalone CLI.
- Starts the API and web servers in the background.
- Opens the browser unless `--no-open` is passed.
- Attempts mobile install only when a supported connected device is detected.
- Mobile install downloads the project archive directly into a temporary directory and deletes it after the run unless `--keep-temp` is passed.
