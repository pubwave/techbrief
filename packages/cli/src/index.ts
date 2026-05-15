#!/usr/bin/env node
import { render } from "ink";
import { resolveCliAppHome } from "./shared/paths/app-home.js";
import { consumeSelectedCommand } from "./app/selected-command.js";
import { runSessionCleanupTasks } from "./shared/process/session-cleanup.js";
import { enterAlternateScreen } from "./shared/terminal/terminal-screen.js";

process.env.TECHBRIEF_HOME = process.env.TECHBRIEF_HOME?.trim() || resolveCliAppHome();

const { buildAppView } = await import("./app/build-app-view.js");
const viewResult = await buildAppView(process.argv.slice(2));
const restoreScreen = viewResult.useAlternateScreen ? enterAlternateScreen() : null;
const app = render(viewResult.view);

let cleanedUp = false;

const cleanup = async (): Promise<void> => {
  if (cleanedUp) {
    return;
  }

  cleanedUp = true;
  await runSessionCleanupTasks();
  restoreScreen?.();
  const selectedCommand = consumeSelectedCommand();
  if (selectedCommand) {
    process.stdout.write(`${selectedCommand}\n`);
  }
};

const handleSignal = (signal: NodeJS.Signals): void => {
  process.once(signal, () => {
    void cleanup().finally(() => {
      process.exit(0);
    });
  });
};

handleSignal("SIGINT");
handleSignal("SIGTERM");
handleSignal("SIGHUP");
app.waitUntilExit().finally(() => {
  void cleanup();
});
