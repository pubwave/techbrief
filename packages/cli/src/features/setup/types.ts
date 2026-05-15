import type { AppConfig } from "@techbrief/shared";
import type { ModelChoice } from "../local-model/index.js";
import type { MobileInstallableDevice, MobilePlatform } from "../mobile-install/index.js";
import type { WizardLocale } from "../../shared/i18n/wizard/index.js";
import type { LocalModelChoiceGroup } from "../local-model/catalog/local-model-catalog.js";
import type { ArticleProcessingState } from "./presentation/article-processing-state.js";
import type { ArticleProcessingProgress } from "../runtime-launch/sync/article-processing-progress.js";

export type FreshnessDays = AppConfig["app"]["freshnessDays"];
export type SetupValueKey =
  | "language"
  | "modelSource"
  | "provider"
  | "model"
  | "apiKey"
  | "freshnessDays"
  | "mobileInstall"
  | "mobilePlatform";

export interface SetupStep {
  id: SetupValueKey;
  title: string;
  hint: string;
  kind?: "choice" | "input";
  choices: ModelChoice[];
  choiceGroups?: LocalModelChoiceGroup[];
  inputMask?: boolean;
  description?: string;
  inputValueKey?: "model" | "apiKey";
}

export interface LaunchOptions {
  apiPort?: number;
  webPort?: number;
  host?: string;
  noOpen?: boolean;
  noMobile?: boolean;
  session?: boolean;
  mobilePlatform?: MobilePlatform;
  templateUrl?: string;
}

export interface SetupLaunchWizardProps {
  launchOptions: LaunchOptions;
  initialState?: SetupState;
}

export type SetupPhase =
  | "setup"
  | "saving"
  | "mobileDeviceChoice"
  | "mobileDeviceSaving"
  | "mobileRetry"
  | "mobileRetrySaving"
  | "done"
  | "error";

export interface SetupState {
  language: string;
  modelSource: "cloud" | "local";
  provider: string;
  model: string;
  cloudModelInputMode: boolean;
  apiKey: string;
  freshnessDays: FreshnessDays;
  mobileInstall: "skip" | "install";
  mobilePlatform: MobilePlatform;
}

export interface LaunchStep {
  label: string;
  ok: boolean;
  detail: string;
}

export interface LaunchResultState {
  ok: boolean;
  apiUrl: string;
  webUrl: string;
  runtimeRoot: string;
  workspaceDir: string;
  steps: LaunchStep[];
}

export interface MobileRetryState {
  apiUrl: string;
  webUrl: string;
  runtimeRoot: string;
  workspaceDir: string;
  steps: LaunchStep[];
  preferredDeviceIds?: string[];
  retryGuideKind?: "ios-signing" | "ios-xcode-missing" | "ios-cocoapods-missing" | "android-tools-missing";
  xcodeWorkspacePath?: string;
  requiresXcodeSigningHelp?: boolean;
  xcodeOpened?: boolean;
}

export interface MobileDeviceChoiceState {
  apiUrl: string;
  webUrl: string;
  runtimeRoot: string;
  workspaceDir: string;
  devices: MobileInstallableDevice[];
  selectedDeviceIds: string[];
}

export interface ProgressLine {
  text: string;
  completedText?: string;
  color?: "cyan" | "yellow" | "green" | "red";
}

export interface DeviceOutputLine {
  text: string;
  color?: "cyan" | "yellow" | "green" | "red";
}

export interface DeviceInstallState {
  deviceId: string;
  label: string;
  status: "installing" | "completed" | "failed";
  detail?: string;
  outputLines: DeviceOutputLine[];
}

export type { ArticleProcessingState };
export type { ArticleProcessingProgress };

export interface VisibleChoiceWindow<T> {
  items: T[];
  startIndex: number;
  hasHiddenAbove: boolean;
  hasHiddenBelow: boolean;
}

export function isWizardLocale(value: string): value is WizardLocale {
  return ["en", "zh-CN", "zh-TW", "ja", "ko", "es", "fr", "de", "pt"].includes(value);
}
