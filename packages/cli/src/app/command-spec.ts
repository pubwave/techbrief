export interface CommandSpec {
  command: string;
  options: readonly string[];
}

export interface HelpCommandSpec {
  line: string;
  commandText: string;
  descriptionKey: string;
}

const LAUNCH_OPTIONS = [
  "api-port",
  "web-port",
  "host",
  "no-open",
  "no-mobile",
  "session",
  "mobile-platform",
  "template-url"
] as const;

export const GLOBAL_OPTIONS = ["help", "version"] as const;

export const COMMAND_SPECS: readonly CommandSpec[] = [
  { command: "", options: LAUNCH_OPTIONS },
  { command: "launch", options: LAUNCH_OPTIONS },
  { command: "setup", options: LAUNCH_OPTIONS },
  { command: "status", options: [] },
  { command: "down", options: [] },
  { command: "logs", options: [] },
  { command: "doctor", options: [] },
  { command: "install", options: [] },
  { command: "up", options: [] },
  { command: "web up", options: [] },
  { command: "web down", options: [] },
  { command: "web logs", options: [] },
  { command: "mobile run android", options: ["api-base-url", "template-url", "keep-temp"] },
  { command: "mobile run ios", options: ["api-base-url", "template-url", "keep-temp"] },
  { command: "sync", options: [] },
  { command: "build", options: [] },
  { command: "init", options: ["language", "provider", "api-key", "days"] },
  { command: "config get", options: [] },
  { command: "config set", options: ["language", "model-source", "provider", "model", "api-key", "days"] },
  { command: "model local install", options: ["model"] },
  { command: "model local list", options: [] },
  { command: "model local use", options: ["model"] },
  { command: "model local uninstall", options: ["model"] },
  { command: "source list", options: [] },
  { command: "source validate", options: ["name", "url", "category", "feed"] },
  { command: "source add", options: ["name", "url", "category", "feed"] },
  { command: "source enable", options: ["id"] },
  { command: "source disable", options: ["id"] },
  { command: "schedule get", options: [] },
  { command: "schedule set", options: ["mode", "hours", "cron", "source", "timezone"] },
  { command: "help", options: [] },
  { command: "version", options: [] }
] as const;

export const HELP_COMMAND_SPECS: readonly HelpCommandSpec[] = [
  { line: "launch", commandText: "techbrief launch", descriptionKey: "help-launch" },
  { line: "setup", commandText: "techbrief setup", descriptionKey: "help-setup" },
  { line: "status", commandText: "techbrief status", descriptionKey: "help-status" },
  { line: "down", commandText: "techbrief down", descriptionKey: "help-down" },
  { line: "logs", commandText: "techbrief logs", descriptionKey: "help-logs" },
  { line: "doctor", commandText: "techbrief doctor", descriptionKey: "help-doctor" },
  { line: "install", commandText: "techbrief install", descriptionKey: "help-install" },
  { line: "up", commandText: "techbrief up", descriptionKey: "help-up" },
  { line: "web up", commandText: "techbrief web up", descriptionKey: "help-web-up" },
  { line: "web down", commandText: "techbrief web down", descriptionKey: "help-web-down" },
  { line: "web logs", commandText: "techbrief web logs", descriptionKey: "help-web-logs" },
  { line: "mobile run android", commandText: "techbrief mobile run android", descriptionKey: "help-mobile-run-android" },
  { line: "mobile run ios", commandText: "techbrief mobile run ios", descriptionKey: "help-mobile-run-ios" },
  { line: "sync", commandText: "techbrief sync", descriptionKey: "help-sync" },
  { line: "build", commandText: "techbrief build", descriptionKey: "help-build" },
  { line: "init --language=ja --provider=openai --days=3", commandText: "techbrief init --language=ja --provider=openai --days=3", descriptionKey: "help-init" },
  { line: "config get", commandText: "techbrief config get", descriptionKey: "help-config-get" },
  { line: "config set --language=ja --model-source=cloud --provider=openai --model=gpt-5.2-chat-latest", commandText: "techbrief config set --language=ja --model-source=cloud --provider=openai --model=gpt-5.2-chat-latest", descriptionKey: "help-config-set" },
  { line: "model local install --model=qwen2.5:7b", commandText: "techbrief model local install --model=qwen2.5:7b", descriptionKey: "help-model-local-install" },
  { line: "model local list", commandText: "techbrief model local list", descriptionKey: "help-model-local-list" },
  { line: "model local use --model=qwen2.5:7b", commandText: "techbrief model local use --model=qwen2.5:7b", descriptionKey: "help-model-local-use" },
  { line: "model local uninstall --model=qwen2.5:7b", commandText: "techbrief model local uninstall --model=qwen2.5:7b", descriptionKey: "help-model-local-uninstall" },
  { line: "source list", commandText: "techbrief source list", descriptionKey: "help-source-list" },
  { line: "source validate --name=... --url=... --category=tech-news|indie-dev", commandText: "techbrief source validate --name=... --url=... --category=tech-news|indie-dev", descriptionKey: "help-source-validate" },
  { line: "source add --name=... --url=... --category=tech-news|indie-dev", commandText: "techbrief source add --name=... --url=... --category=tech-news|indie-dev", descriptionKey: "help-source-add" },
  { line: "source enable --id=...", commandText: "techbrief source enable --id=...", descriptionKey: "help-source-enable" },
  { line: "source disable --id=...", commandText: "techbrief source disable --id=...", descriptionKey: "help-source-disable" },
  { line: "schedule get", commandText: "techbrief schedule get", descriptionKey: "help-schedule-get" },
  { line: "schedule set --mode=interval --hours=6", commandText: "techbrief schedule set --mode=interval --hours=6", descriptionKey: "help-schedule-set-interval" },
  { line: "schedule set --mode=cron --cron='0 */6 * * *' --source=openai-blog", commandText: "techbrief schedule set --mode=cron --cron='0 */6 * * *' --source=openai-blog", descriptionKey: "help-schedule-set-cron" },
  { line: "help", commandText: "techbrief help", descriptionKey: "help-help" },
  { line: "version", commandText: "techbrief version", descriptionKey: "help-version" }
] as const;

export function findCommandSpec(command: string): CommandSpec | undefined {
  return COMMAND_SPECS.find((entry) => entry.command === command);
}
