import os from "node:os";
import { wizardMessage, type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import { runCommandAsync } from "../../../shared/paths/workspace.js";
import type {
  MobileCheckStep,
  MobileInstallableDevice,
  MobilePlatform,
  MobileProgressCallbacks,
  MobileReadinessResult
} from "../types.js";

interface FlutterDevice {
  name: string;
  id: string;
  isSupported: boolean;
  targetPlatform: string;
  emulator: boolean;
  sdk: string;
}

export async function inspectMobileReadinessWithFlutterCommand(
  locale: WizardLocale,
  flutterCommand: string,
  callbacks?: MobileProgressCallbacks
): Promise<MobileReadinessResult> {
  await callbacks?.onStep?.("devices");
  const steps: MobileCheckStep[] = [];

  const deviceProbe = await runCommandAsync(flutterCommand, ["devices", "--machine"]);
  const devices = parseDevices(deviceProbe.stdout);
  const physicallyInstallableDevices = installablePhysicalDevices(devices);
  if (physicallyInstallableDevices.length === 0) {
    steps.push({
      label: "device",
      ok: false,
      detail: wizardMessage(locale, "mobileCheckDeviceConnectionMissing")
    });

    return {
      ok: false,
      steps,
      devices: []
    };
  }

  const hasAndroid = physicallyInstallableDevices.some((device) => device.platform === "android");
  const hasIos = physicallyInstallableDevices.some((device) => device.platform === "ios");
  let androidReady = true;
  let iosReady = true;

  if (hasAndroid) {
    await callbacks?.onStep?.("android-tools");
    const adbCheck = await checkAndroidEnvironment(locale);
    steps.push(adbCheck);
    androidReady = adbCheck.ok;
  }

  if (hasIos) {
    await callbacks?.onStep?.("ios-tools");
    const iosChecks = await checkIosEnvironment(locale);
    steps.push(...iosChecks);
    iosReady = iosChecks.every((step) => step.ok);
  }

  const availableDevices = physicallyInstallableDevices.filter((device) =>
    (device.platform === "android" && androidReady) || (device.platform === "ios" && iosReady)
  );

  steps.push({
    label: "device",
    ok: availableDevices.length > 0,
    detail: availableDevices.length > 0
      ? availableDevices.map((device) => device.label).join(", ")
      : wizardMessage(locale, "mobileCheckDeviceConnectionMissing")
  });

  return {
    ok: steps.every((step) => step.ok),
    steps,
    devices: availableDevices
  };
}

export function buildFlutterRunArgs(
  deviceId: string,
  apiBaseUrl?: string,
  options?: { noResident?: boolean }
): string[] {
  const args = ["run", "--release", "-d", deviceId];

  if (apiBaseUrl) {
    args.push(`--dart-define=TECHBRIEF_API_BASE_URL=${apiBaseUrl}`);
  }

  if (options?.noResident) {
    args.push("--no-resident");
  }

  return args;
}

function parseDevices(output: string): FlutterDevice[] {
  try {
    const payload = JSON.parse(output) as FlutterDevice[];
    return Array.isArray(payload) ? payload : [];
  } catch {
    return [];
  }
}

function platformFromDevice(device: FlutterDevice): MobilePlatform | null {
  const targetPlatform = device.targetPlatform.trim().toLowerCase();

  if (targetPlatform.startsWith("android")) {
    return "android";
  }

  if (targetPlatform.startsWith("ios")) {
    return "ios";
  }

  return null;
}

function installablePhysicalDevices(devices: FlutterDevice[]): MobileInstallableDevice[] {
  return devices.flatMap((device) => {
    if (!device.isSupported || device.emulator) {
      return [];
    }

    const platform = platformFromDevice(device);
    if (!platform) {
      return [];
    }

    return {
      id: device.id,
      name: device.name,
      platform,
      label: `${device.name} (${platform === "ios" ? "iPhone" : "Android"})`
    };
  });
}

async function checkCommand(
  locale: WizardLocale,
  label: string,
  command: string,
  args: string[],
  missingDetail: string
): Promise<MobileCheckStep> {
  const result = await runCommandAsync(command, args);

  return {
    label,
    ok: result.ok,
    detail: result.ok
      ? firstOutputLine(result.stdout || result.stderr, wizardMessage(locale, "mobileCheckReady"))
      : missingDetail
  };
}

async function checkAndroidEnvironment(locale: WizardLocale): Promise<MobileCheckStep> {
  return await checkCommand(
    locale,
    "adb",
    "adb",
    ["version"],
    wizardMessage(locale, "mobileCheckAndroidToolsMissing")
  );
}

async function checkIosEnvironment(locale: WizardLocale): Promise<MobileCheckStep[]> {
  if (os.platform() !== "darwin") {
    return [{
      label: "ios-host",
      ok: false,
      detail: wizardMessage(locale, "mobileCheckIosMacRequired")
    }];
  }

  return await Promise.all([
    checkCommand(
      locale,
      "xcode",
      "xcodebuild",
      ["-version"],
      wizardMessage(locale, "mobileCheckXcodeMissing")
    ),
    checkCommand(
      locale,
      "cocoapods",
      "pod",
      ["--version"],
      wizardMessage(locale, "mobileCheckCocoapodsMissing")
    )
  ]);
}

function firstOutputLine(output: string, fallback: string): string {
  return output
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean) ?? fallback;
}
