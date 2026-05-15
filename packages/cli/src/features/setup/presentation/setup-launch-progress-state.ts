import { useCallback, useMemo, useState } from "react";
import type { FlutterProgressEvent } from "../../mobile-install/workflow/flutter-sdk.js";
import type { FeedArticle } from "@techbrief/shared";
import type {
  DeviceRunResult,
  MobileInstallableDevice,
  MobileProgressStage
} from "../../mobile-install/index.js";
import { type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import { yieldToUi } from "../helpers.js";
import type {
  ArticleProcessingState,
  DeviceInstallState,
  ProgressLine
} from "../types.js";
import {
  appendDeviceOutputLines,
  appendOutputLines,
  buildProgressLine,
  finishDeviceInstallState,
  startDeviceInstallState,
  updateLastProgressLine
} from "./setup-launch-progress-updaters.js";
import { appendMobileFlutterProgressEvent, appendMobileProgressStage } from "./setup-launch-mobile-progress.js";
import {
  clearArticleProcessingStates,
  upsertArticleProcessingState
} from "./article-processing-state.js";
import {
  emptyArticleProcessingProgress,
  type ArticleProcessingProgress
} from "../../runtime-launch/sync/article-processing-progress.js";

export interface SetupLaunchProgressState {
  articleProcessingProgress: ArticleProcessingProgress;
  articleProcessingStates: ArticleProcessingState[];
  deviceInstallStates: DeviceInstallState[];
  progressLines: ProgressLine[];
  outputLines: ProgressLine[];
  resetProgressState: () => void;
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
  appendOutput: (
    rawText: string,
    stream: "stdout" | "stderr",
    device?: MobileInstallableDevice
  ) => void;
  updateArticleProcessingProgress: (progress: ArticleProcessingProgress) => void;
  clearOutput: () => void;
  updateArticleProcessingState: (article: FeedArticle, status: ArticleProcessingState["status"]) => void;
  clearArticleProcessingStates: () => void;
  appendMobileFlutterProgress: (event: FlutterProgressEvent) => Promise<void>;
  appendMobileProgress: (
    stage: MobileProgressStage,
    device?: MobileInstallableDevice
  ) => Promise<void>;
  completeDeviceInstall: (deviceResult: DeviceRunResult) => Promise<void>;
}

export function useSetupLaunchProgressState(locale: WizardLocale): SetupLaunchProgressState {
  const [articleProcessingProgress, setArticleProcessingProgress] = useState<ArticleProcessingProgress>(
    emptyArticleProcessingProgress()
  );
  const [articleProcessingStates, setArticleProcessingStates] = useState<ArticleProcessingState[]>([]);
  const [progressLines, setProgressLines] = useState<ProgressLine[]>([]);
  const [outputLines, setOutputLines] = useState<ProgressLine[]>([]);
  const [deviceInstallStates, setDeviceInstallStates] = useState<DeviceInstallState[]>([]);

  const resetProgressState = useCallback((): void => {
    setProgressLines([]);
    setOutputLines([]);
    setDeviceInstallStates([]);
    setArticleProcessingProgress(emptyArticleProcessingProgress());
    setArticleProcessingStates([]);
  }, []);

  const appendProgress = useCallback((
    text: string,
    color: ProgressLine["color"] = "cyan",
    completedText?: string
  ): void => {
    setProgressLines((currentLines) => [...currentLines, buildProgressLine(text, color, completedText)]);
  }, []);

  const updateLastProgress = useCallback((
    text: string,
    color?: ProgressLine["color"],
    completedText?: string
  ): void => {
    setProgressLines((currentLines) => updateLastProgressLine(currentLines, text, color, completedText));
  }, []);

  const appendProgressAndYield = useCallback(async (
    text: string,
    color: ProgressLine["color"] = "cyan",
    completedText?: string
  ): Promise<void> => {
    appendProgress(text, color, completedText);
    await yieldToUi();
  }, [appendProgress]);

  const updateProgressAndYield = useCallback(async (
    text: string,
    color?: ProgressLine["color"],
    completedText?: string
  ): Promise<void> => {
    updateLastProgress(text, color, completedText);
    await yieldToUi();
  }, [updateLastProgress]);

  const appendOutput = useCallback((
    rawText: string,
    _stream: "stdout" | "stderr",
    device?: MobileInstallableDevice
  ): void => {
    if (device) {
      setDeviceInstallStates((currentStates) => appendDeviceOutputLines(currentStates, rawText, device));
      return;
    }

    setOutputLines((currentLines) => appendOutputLines(currentLines, rawText));
  }, []);

  const clearOutput = useCallback((): void => {
    setOutputLines([]);
  }, []);

  const updateArticleProcessingProgress = useCallback((progress: ArticleProcessingProgress): void => {
    setArticleProcessingProgress(progress);
  }, []);

  const updateArticleProcessingState = useCallback((
    article: FeedArticle,
    status: ArticleProcessingState["status"]
  ): void => {
    setArticleProcessingStates((currentStates) => upsertArticleProcessingState(currentStates, article, status, locale));
  }, [locale]);

  const resetArticleProcessingStates = useCallback((): void => {
    setArticleProcessingStates(clearArticleProcessingStates());
    setArticleProcessingProgress(emptyArticleProcessingProgress());
  }, []);

  const appendMobileFlutterProgress = useCallback(async (event: FlutterProgressEvent): Promise<void> => {
    await appendMobileFlutterProgressEvent(locale, event, {
      appendProgressAndYield,
      updateLastProgress
    });
  }, [appendProgressAndYield, locale, updateLastProgress]);

  const appendMobileProgress = useCallback(async (
    stage: MobileProgressStage,
    device?: MobileInstallableDevice
  ): Promise<void> => {
    await appendMobileProgressStage(locale, stage, device, {
      appendProgressAndYield,
      updateLastProgress,
      startDeviceInstall: (installDevice) => {
        setDeviceInstallStates((currentStates) => startDeviceInstallState(currentStates, installDevice));
      }
    });
  }, [appendProgressAndYield, locale, updateLastProgress]);

  const completeDeviceInstall = useCallback(async (deviceResult: DeviceRunResult): Promise<void> => {
    setDeviceInstallStates((currentStates) => finishDeviceInstallState(currentStates, {
      deviceId: deviceResult.device.id,
      label: deviceResult.device.label,
      ok: deviceResult.ok,
      detail: deviceResult.detail
    }));
    await yieldToUi();
  }, []);

  return useMemo(() => ({
    articleProcessingProgress,
    articleProcessingStates,
    deviceInstallStates,
    progressLines,
    outputLines,
    resetProgressState,
    appendProgress,
    appendProgressAndYield,
    updateProgressAndYield,
    appendOutput,
    updateArticleProcessingProgress,
    clearOutput,
    updateArticleProcessingState,
    clearArticleProcessingStates: resetArticleProcessingStates,
    appendMobileFlutterProgress,
    appendMobileProgress,
    completeDeviceInstall
  }), [
    articleProcessingProgress,
    articleProcessingStates,
    appendMobileFlutterProgress,
    appendMobileProgress,
    appendOutput,
    updateArticleProcessingProgress,
    clearOutput,
    updateArticleProcessingState,
    resetArticleProcessingStates,
    appendProgress,
    appendProgressAndYield,
    updateProgressAndYield,
    completeDeviceInstall,
    deviceInstallStates,
    outputLines,
    progressLines,
    resetProgressState
  ]);
}
