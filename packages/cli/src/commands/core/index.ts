import React from "react";
import { type LaunchOptions } from "../../app/launch-options.js";
import { helpScreenView, helpView, versionView } from "./help-version.js";
import {
  buildWorkspaceView,
  doctorView,
  downView,
  installView,
  launchView,
  logsView,
  mobileRunView,
  statusView,
  syncView,
  upView,
  webDockerView
} from "./views.js";
import { startupView as startupCommandView } from "./startup.js";

export { doctorView } from "./views.js";
export { helpScreenView, helpView, versionView } from "./help-version.js";

export async function startupView(command: string, options: Record<string, string | boolean>, launchOptions: LaunchOptions): Promise<React.ReactElement | null> {
  switch (command) {
    case "":
    case "setup":
      return await startupCommandView(command, options, launchOptions);
    case "launch":
      return launchView(launchOptions);
    case "status":
      return statusView();
    case "down":
      return downView();
    case "logs":
      return logsView();
    case "doctor":
      return doctorView();
    case "install":
      return installView();
    case "up":
      return upView();
    case "web up":
      return webDockerView("up");
    case "web down":
      return webDockerView("down");
    case "web logs":
      return webDockerView("logs");
    case "mobile run android":
      return mobileRunView("android", options);
    case "mobile run ios":
      return mobileRunView("ios", options);
    case "sync":
      return syncView();
    case "build":
      return buildWorkspaceView();
    default:
      return null;
  }
}
