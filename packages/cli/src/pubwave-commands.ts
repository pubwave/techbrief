import type { CliCommand } from "@pubwave/cli";
import type { AppConfig } from "@techbrief/shared";
import { configGetView, configSetView, initView } from "./commands/config/index.js";
import {
  buildWorkspaceView,
  doctorView,
  installView,
  syncView,
  upView,
  webDockerView
} from "./commands/core/views.js";
import { scheduleGetView, scheduleSetView } from "./commands/schedule/index.js";
import { sourceAddView, sourceListView, sourceStateView, sourceValidateView } from "./commands/source/index.js";

type Command = CliCommand<AppConfig>;

export const techbriefCommands: Command[] = [
  {
    name: "init",
    description: "Initialize TechBrief config (non-interactive, flag-driven).",
    options: ["language", "provider", "model", "model-source", "api-key", "days"],
    run: async (_context, options) => initView(options)
  },
  {
    name: "config get",
    description: "Show TechBrief AppConfig (overrides built-in to include freshnessDays and schedule).",
    run: async () => configGetView()
  },
  {
    name: "config set",
    description: "Update TechBrief AppConfig (overrides built-in to write freshnessDays etc.).",
    options: ["language", "model-source", "provider", "model", "api-key", "days"],
    run: async (_context, options) => configSetView(options)
  },
  {
    name: "doctor",
    description: "Run environment diagnostics (Node, npm, Docker, ADB, Xcode, Ollama, Flutter).",
    run: async () => doctorView()
  },
  {
    name: "install",
    description: "Install npm dependencies and the Flutter mobile project.",
    run: async () => installView()
  },
  {
    name: "up",
    description: "Hint for how to start the TechBrief runtime.",
    run: async () => upView()
  },
  {
    name: "sync",
    description: "Run a one-off feed sync.",
    run: async () => syncView()
  },
  {
    name: "build",
    description: "Build web bundle and run Flutter static checks.",
    run: async () => buildWorkspaceView()
  },
  {
    name: "web up",
    description: "Bring up the dockerized web stack.",
    run: async () => webDockerView("up")
  },
  {
    name: "web down",
    description: "Tear down the dockerized web stack.",
    run: async () => webDockerView("down")
  },
  {
    name: "web logs",
    description: "Show dockerized web stack logs.",
    run: async () => webDockerView("logs")
  },
  {
    name: "source list",
    description: "List configured feed sources.",
    run: async () => sourceListView()
  },
  {
    name: "source validate",
    description: "Validate a feed source URL.",
    options: ["url"],
    run: async (_context, options) => sourceValidateView(options)
  },
  {
    name: "source add",
    description: "Add a custom feed source.",
    options: ["url", "category", "name"],
    run: async (_context, options) => sourceAddView(options)
  },
  {
    name: "source enable",
    description: "Enable a feed source.",
    options: ["id"],
    run: async (_context, options) => sourceStateView("enabled", options)
  },
  {
    name: "source disable",
    description: "Disable a feed source.",
    options: ["id"],
    run: async (_context, options) => sourceStateView("disabled", options)
  },
  {
    name: "schedule get",
    description: "Show schedule configuration.",
    run: async () => scheduleGetView()
  },
  {
    name: "schedule set",
    description: "Update schedule configuration.",
    options: ["mode", "interval-minutes", "cron"],
    run: async (_context, options) => scheduleSetView(options)
  }
];
