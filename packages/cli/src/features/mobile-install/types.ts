import type { FlutterProgressEvent } from "./workflow/flutter-sdk.js";
import type { WizardLocale } from "../../shared/i18n/wizard/index.js";

export type MobilePlatform = "android" | "ios";

export interface MobileInstallableDevice {
  id: string;
  name: string;
  platform: MobilePlatform;
  label: string;
}

export interface MobileRunInput {
  platform?: MobilePlatform;
  apiBaseUrl?: string;
  keepTemp?: boolean;
  templateUrl?: string;
  workspaceDir?: string;
  interactive?: boolean;
  noResident?: boolean;
  locale?: WizardLocale;
  selectedDevices?: MobileInstallableDevice[];
  skipReadinessCheck?: boolean;
}

export interface MobileRunResult {
  ok: boolean;
  tempRoot: string;
  workspaceDir: string;
  mobileDir: string;
  templateUrl: string;
  selectedDevice?: MobileInstallableDevice;
  cleanupPerformed: boolean;
  steps: Array<{ label: string; ok: boolean; detail: string }>;
}

export interface MobileCheckStep {
  label: string;
  ok: boolean;
  detail: string;
}

export interface MobileReadinessResult {
  ok: boolean;
  steps: MobileCheckStep[];
  devices: MobileInstallableDevice[];
}

export type MobileProgressStage =
  | "flutter"
  | "devices"
  | "android-tools"
  | "ios-tools"
  | "template"
  | "dependencies"
  | "install-device";

export interface DeviceRunResult {
  device: MobileInstallableDevice;
  ok: boolean;
  detail: string;
  label: string;
}

export interface MobileProgressCallbacks {
  onStep?: (stage: MobileProgressStage, device?: MobileInstallableDevice) => void | Promise<void>;
  onFlutterProgress?: (event: FlutterProgressEvent) => void | Promise<void>;
  onCommandOutput?: (
    chunk: string,
    stream: "stdout" | "stderr",
    device?: MobileInstallableDevice
  ) => void | Promise<void>;
  onDeviceComplete?: (result: DeviceRunResult) => void | Promise<void>;
}
