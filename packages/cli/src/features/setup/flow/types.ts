import type { FlutterProgressEvent } from "../../mobile-install/workflow/flutter-sdk.js";
import type { FeedArticle } from "@techbrief/shared";
import type {
  DeviceRunResult,
  MobileInstallableDevice,
  MobileProgressStage
} from "../../mobile-install/index.js";
import type {
  ArticleProcessingState,
  ArticleProcessingProgress,
  LaunchOptions,
  LaunchResultState,
  MobileDeviceChoiceState,
  MobileRetryState,
  ProgressLine,
  SetupState
} from "../types.js";
import type { WizardLocale } from "../../../shared/i18n/wizard/index.js";

export interface SetupLaunchUiActions {
  appendProgress: (
    text: string,
    color?: ProgressLine["color"],
    completedText?: string
  ) => void;
  appendProgressAndYield: (
    text: string,
    color?: ProgressLine["color"],
    completedText?: string
  ) => Promise<void>;
  updateProgressAndYield: (
    text: string,
    color?: ProgressLine["color"],
    completedText?: string
  ) => Promise<void>;
  appendMobileProgress: (
    stage: MobileProgressStage,
    device?: MobileInstallableDevice
  ) => Promise<void>;
  appendMobileFlutterProgress: (event: FlutterProgressEvent) => Promise<void>;
  appendOutput: (
    rawText: string,
    stream: "stdout" | "stderr",
    device?: MobileInstallableDevice
  ) => void;
  updateArticleProcessingProgress: (progress: ArticleProcessingProgress) => void;
  clearOutput: () => void;
  updateArticleProcessingState: (article: FeedArticle, status: ArticleProcessingState["status"]) => void;
  clearArticleProcessingStates: () => void;
  completeDeviceInstall: (deviceResult: DeviceRunResult) => Promise<void>;
  setInstallMessage: (message: string | null) => void;
}

export interface SetupLaunchFlowInput {
  launchOptions: LaunchOptions;
  locale: WizardLocale;
  state: SetupState;
  actions: SetupLaunchUiActions;
  onServicesReady?: (input: {
    apiUrl: string;
    webUrl: string;
    runtimeRoot: string;
    workspaceDir: string;
  }) => Promise<void> | void;
}

export type SetupLaunchFlowResult =
  | { kind: "done"; launchResult: LaunchResultState }
  | { kind: "choice"; launchResult: LaunchResultState; choiceState: MobileDeviceChoiceState }
  | { kind: "retry"; launchResult: LaunchResultState; retryState: MobileRetryState };
