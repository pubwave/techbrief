import type { MobileInstallableDevice } from "../../mobile-install/index.js";
import {
  appendDeviceOutput,
  finishDeviceInstall,
  startDeviceInstall
} from "../../mobile-install/components/device-install-progress.js";
import type {
  DeviceInstallState,
  DeviceOutputLine,
  ProgressLine
} from "../types.js";
import { MAX_OUTPUT_LINES } from "../helpers.js";
import { mergeOutputLines, normalizeSetupOutputLines } from "./setup-launch-output.js";

export function buildProgressLine(
  text: string,
  color?: ProgressLine["color"],
  completedText?: string
): ProgressLine {
  return {
    text,
    ...(color ? { color } : {}),
    ...(completedText ? { completedText } : {})
  };
}

export function updateLastProgressLine(
  currentLines: ProgressLine[],
  text: string,
  color?: ProgressLine["color"],
  completedText?: string
): ProgressLine[] {
  if (currentLines.length === 0) {
    return currentLines;
  }

  const nextLines = [...currentLines];
  const lastLine = nextLines[nextLines.length - 1];
  nextLines[nextLines.length - 1] = {
    ...lastLine,
    text,
    ...(color ? { color } : {}),
    ...(completedText ? { completedText } : {})
  };
  return nextLines;
}

export function appendOutputLines(
  currentLines: ProgressLine[],
  rawText: string
): ProgressLine[] {
  const lines = normalizeSetupOutputLines(rawText);
  if (lines.length === 0) {
    return currentLines;
  }

  const nextLines = mergeOutputLines(
    currentLines,
    lines.map((line) => ({
      text: line,
      color: "cyan" as const
    }))
  );

  return nextLines.slice(-MAX_OUTPUT_LINES);
}

export function appendDeviceOutputLines(
  currentStates: DeviceInstallState[],
  rawText: string,
  device: MobileInstallableDevice
): DeviceInstallState[] {
  const lines = normalizeSetupOutputLines(rawText);
  if (lines.length === 0) {
    return currentStates;
  }

  return appendDeviceOutput(currentStates, {
    deviceId: device.id,
    label: device.label,
    lines: lines.map((line): DeviceOutputLine => ({
      text: line,
      color: "cyan"
    }))
  });
}

export function startDeviceInstallState(
  currentStates: DeviceInstallState[],
  device: MobileInstallableDevice
): DeviceInstallState[] {
  return startDeviceInstall(currentStates, {
    deviceId: device.id,
    label: device.label
  });
}

export function finishDeviceInstallState(
  currentStates: DeviceInstallState[],
  input: {
    deviceId: string;
    label: string;
    ok: boolean;
    detail: string;
  }
): DeviceInstallState[] {
  return finishDeviceInstall(currentStates, input);
}
