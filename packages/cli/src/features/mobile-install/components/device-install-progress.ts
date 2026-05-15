import type { DeviceInstallState, DeviceOutputLine } from "../../setup/types.js";

const MAX_DEVICE_OUTPUT_LINES = 24;

export function startDeviceInstall(
  states: DeviceInstallState[],
  input: { deviceId: string; label: string }
): DeviceInstallState[] {
  const current = states.find((state) => state.deviceId === input.deviceId);

  if (current) {
    return states.map((state) => state.deviceId === input.deviceId
      ? { ...state, label: input.label, status: "installing" }
      : state);
  }

  return [
    ...states,
    {
      deviceId: input.deviceId,
      label: input.label,
      status: "installing",
      outputLines: []
    }
  ];
}

export function appendDeviceOutput(
  states: DeviceInstallState[],
  input: { deviceId: string; label: string; lines: DeviceOutputLine[] }
): DeviceInstallState[] {
  const nextStates = startDeviceInstall(states, {
    deviceId: input.deviceId,
    label: input.label
  });

  return nextStates.map((state) => state.deviceId === input.deviceId
    ? {
        ...state,
        outputLines: [...state.outputLines, ...input.lines].slice(-MAX_DEVICE_OUTPUT_LINES)
      }
    : state);
}

export function finishDeviceInstall(
  states: DeviceInstallState[],
  input: { deviceId: string; label: string; ok: boolean; detail: string }
): DeviceInstallState[] {
  const nextStates = startDeviceInstall(states, {
    deviceId: input.deviceId,
    label: input.label
  });

  return nextStates.map((state) => state.deviceId === input.deviceId
    ? {
        ...state,
        status: input.ok ? "completed" : "failed",
        detail: input.detail
      }
    : state);
}
