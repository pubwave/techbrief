import { wizardMessage, type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import type { FlutterProgressEvent } from "../../mobile-install/workflow/flutter-sdk.js";
import type {
  MobileInstallableDevice,
  MobileProgressStage
} from "../../mobile-install/index.js";
import { yieldToUi } from "../helpers.js";
import { buildFlutterDownloadProgressText } from "./setup-launch-progress.js";

interface ProgressActions {
  appendProgressAndYield: (
    text: string,
    color?: "cyan" | "yellow" | "green" | "red",
    completedText?: string
  ) => Promise<void>;
  updateLastProgress: (
    text: string,
    color?: "cyan" | "yellow" | "green" | "red",
    completedText?: string
  ) => void;
  startDeviceInstall: (device: MobileInstallableDevice) => void;
}

const mobileStageMessages: Record<
  Exclude<MobileProgressStage, "install-device">,
  {
    start: Parameters<typeof wizardMessage>[1];
    done: Parameters<typeof wizardMessage>[1];
  }
> = {
  flutter: { start: "progressMobileFlutter", done: "progressMobileFlutterReady" },
  devices: { start: "progressMobileDevices", done: "progressMobileDevicesReady" },
  "android-tools": { start: "progressMobileAndroidTools", done: "progressMobileAndroidToolsReady" },
  "ios-tools": { start: "progressMobileIosTools", done: "progressMobileIosToolsReady" },
  template: { start: "progressMobileTemplate", done: "progressMobileTemplateReady" },
  dependencies: { start: "progressMobileDependencies", done: "progressMobileDependenciesReady" }
};

export async function appendMobileFlutterProgressEvent(
  locale: WizardLocale,
  event: FlutterProgressEvent,
  actions: Pick<ProgressActions, "appendProgressAndYield" | "updateLastProgress">
): Promise<void> {
  switch (event.stage) {
    case "download":
      if ((event.receivedBytes ?? 0) === 0) {
        await actions.appendProgressAndYield(
          wizardMessage(locale, "progressMobileFlutterDownload"),
          "yellow",
          wizardMessage(locale, "progressMobileFlutterDownloaded")
        );
        return;
      }

      actions.updateLastProgress(
        buildFlutterDownloadProgressText(locale, event),
        "yellow",
        wizardMessage(locale, "progressMobileFlutterDownloaded")
      );
      return;
    case "extract":
      await actions.appendProgressAndYield(
        wizardMessage(locale, "progressMobileFlutterExtract"),
        "yellow",
        wizardMessage(locale, "progressMobileFlutterExtracted")
      );
      return;
    case "ready":
      return;
  }
}

export async function appendMobileProgressStage(
  locale: WizardLocale,
  stage: MobileProgressStage,
  device: MobileInstallableDevice | undefined,
  actions: ProgressActions
): Promise<void> {
  if (stage === "install-device") {
    if (!device) {
      return;
    }

    actions.startDeviceInstall(device);
    await yieldToUi();
    return;
  }

  const keys = mobileStageMessages[stage];
  await actions.appendProgressAndYield(
    wizardMessage(locale, keys.start),
    "cyan",
    wizardMessage(locale, keys.done)
  );
}
