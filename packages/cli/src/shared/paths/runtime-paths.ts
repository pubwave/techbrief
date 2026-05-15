import path from "node:path";
import { resolveCliAppHome } from "./app-home.js";

export function runtimeRoot(): string {
  return path.join(resolveCliAppHome(), "runtime");
}

export function processRoot(): string {
  return path.join(runtimeRoot(), "processes");
}

export function logsRoot(): string {
  return path.join(runtimeRoot(), "logs");
}

export function processFiles(name: "api" | "web" | "scheduler" | "local-runtime") {
  return {
    pidFile: path.join(processRoot(), `${name}.pid`),
    logFile: path.join(logsRoot(), `${name}.log`)
  };
}
