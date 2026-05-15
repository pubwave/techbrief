import type { MobileInstallableDevice } from "../../mobile-install/index.js";

export interface RetryDeviceSelection {
  status: "unavailable" | "choice" | "selected";
  devices: MobileInstallableDevice[];
}

export function resolveRetryDeviceSelection(
  devices: MobileInstallableDevice[],
  preferredDeviceIds?: string[]
): RetryDeviceSelection {
  if (devices.length === 0) {
    return {
      status: "unavailable",
      devices: []
    };
  }

  // On retry, always reflect the current device set. If the user has connected
  // another phone since the last attempt, show the chooser again instead of
  // silently restricting the flow to the previous device ids.
  if (devices.length > 1) {
    return {
      status: "choice",
      devices
    };
  }

  return {
    status: "selected",
    devices
  };
}
