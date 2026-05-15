import { useCallback, useEffect, useRef } from "react";
import { openBrowser } from "../../../shared/browser/browser.js";
import { wizardMessage, type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import { continueMobileSetup } from "../flow/setup-launch-mobile-flow.js";
import { runSetupLaunchFlow } from "../flow/setup-launch-main-flow.js";
import { useSetupLaunchProgressState } from "../presentation/setup-launch-progress-state.js";
import type {
  ArticleProcessingProgress,
  ArticleProcessingState,
  DeviceInstallState,
  LaunchOptions,
  LaunchResultState,
  MobileDeviceChoiceState,
  MobileRetryState,
  ProgressLine,
  SetupPhase,
  SetupState
} from "../types.js";

interface UseSetupLaunchInput {
  phase: SetupPhase;
  launchOptions: LaunchOptions;
  locale: WizardLocale;
  mobileDeviceChoiceState: MobileDeviceChoiceState | null;
  mobileRetryState: MobileRetryState | null;
  state: SetupState;
  setPhase: (phase: SetupPhase) => void;
  setLaunchResult: (result: LaunchResultState | null) => void;
  setMobileDeviceChoiceState: (state: MobileDeviceChoiceState | null) => void;
  setMobileRetryState: (state: MobileRetryState | null) => void;
  setError: (error: string | null) => void;
  setInstallMessage: (message: string | null) => void;
}

interface UseSetupLaunchOutput {
  articleProcessingProgress: ArticleProcessingProgress;
  articleProcessingStates: ArticleProcessingState[];
  deviceInstallStates: DeviceInstallState[];
  progressLines: ProgressLine[];
  outputLines: ProgressLine[];
}

export function useSetupLaunch(input: UseSetupLaunchInput): UseSetupLaunchOutput {
  const browserOpenedRef = useRef(false);
  const progress = useSetupLaunchProgressState(input.locale);
  const {
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
    clearArticleProcessingStates,
    appendMobileFlutterProgress,
    appendMobileProgress,
    completeDeviceInstall
  } = progress;

  const finalizeSetupResult = useCallback(async (result: LaunchResultState): Promise<void> => {
    if (input.launchOptions.noOpen !== true && !browserOpenedRef.current) {
      appendProgress(
        wizardMessage(input.locale, "progressOpenBrowser"),
        "cyan",
        wizardMessage(input.locale, "progressOpenedBrowser")
      );
      openBrowser(result.webUrl);
      browserOpenedRef.current = true;
    }

    input.setMobileDeviceChoiceState(null);
    input.setMobileRetryState(null);
    input.setLaunchResult(result);
    input.setPhase("done");
  }, [
    input.launchOptions.noOpen,
    input.locale,
    input.setLaunchResult,
    input.setMobileDeviceChoiceState,
    input.setMobileRetryState,
    input.setPhase,
    appendProgress
  ]);

  useEffect(() => {
    if (input.phase !== "saving" && input.phase !== "mobileRetrySaving" && input.phase !== "mobileDeviceSaving") {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        input.setInstallMessage(null);
        resetProgressState();

        const flowActions = {
          appendProgress,
          appendProgressAndYield,
          updateProgressAndYield,
          appendMobileProgress,
          appendMobileFlutterProgress,
          appendOutput,
          updateArticleProcessingProgress,
          clearOutput,
          updateArticleProcessingState,
          clearArticleProcessingStates,
          completeDeviceInstall,
          setInstallMessage: input.setInstallMessage
        };

        if (input.phase === "mobileRetrySaving" || input.phase === "mobileDeviceSaving") {
          const result = await continueMobileSetup({
            phase: input.phase,
            launchOptions: input.launchOptions,
            locale: input.locale,
            mobileDeviceChoiceState: input.mobileDeviceChoiceState,
            mobileRetryState: input.mobileRetryState,
            actions: flowActions
          });

          if (cancelled) {
            return;
          }

          if (result.kind === "error") {
            input.setError(result.error);
            input.setPhase("error");
            return;
          }

          if (result.kind === "retry") {
            input.setMobileDeviceChoiceState(null);
            input.setMobileRetryState(result.retryState);
            input.setPhase("mobileRetry");
            return;
          }

          if (result.kind === "choice") {
            input.setMobileRetryState(null);
            input.setMobileDeviceChoiceState(result.choiceState);
            input.setPhase("mobileDeviceChoice");
            return;
          }

          input.setLaunchResult(result.launchResult);
          await finalizeSetupResult(result.launchResult);
          return;
        }

        const result = await runSetupLaunchFlow({
          launchOptions: input.launchOptions,
          locale: input.locale,
          state: input.state,
          actions: flowActions,
          onServicesReady: async ({ webUrl }) => {
            if (input.launchOptions.noOpen === true || browserOpenedRef.current) {
              return;
            }

            appendProgress(
              wizardMessage(input.locale, "progressOpenBrowser"),
              "cyan",
              wizardMessage(input.locale, "progressOpenedBrowser")
            );
            openBrowser(webUrl);
            browserOpenedRef.current = true;
          }
        });

        if (cancelled) {
          return;
        }

        input.setLaunchResult(result.launchResult);

        if (result.kind === "retry") {
          input.setMobileRetryState(result.retryState);
          input.setPhase("mobileRetry");
          return;
        }

        if (result.kind === "choice") {
          input.setMobileRetryState(null);
          input.setMobileDeviceChoiceState(result.choiceState);
          input.setPhase("mobileDeviceChoice");
          return;
        }

        await finalizeSetupResult(result.launchResult);
      } catch (launchError) {
        if (!cancelled) {
          input.setError(
            launchError instanceof Error
              ? launchError.message
              : wizardMessage(input.locale, "setupUnknownError")
          );
          input.setPhase("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    finalizeSetupResult,
    input.launchOptions,
    input.locale,
    input.mobileDeviceChoiceState,
    input.mobileRetryState,
    input.phase,
    input.setError,
    input.setInstallMessage,
    input.setLaunchResult,
    input.setMobileDeviceChoiceState,
    input.setMobileRetryState,
    input.setPhase,
    input.state,
    resetProgressState,
    appendProgress,
    appendProgressAndYield,
    appendOutput,
    updateArticleProcessingProgress,
    clearOutput,
    updateArticleProcessingState,
    clearArticleProcessingStates,
    appendMobileFlutterProgress,
    appendMobileProgress,
    updateProgressAndYield,
    completeDeviceInstall
  ]);

  return {
    articleProcessingProgress,
    articleProcessingStates,
    deviceInstallStates,
    progressLines,
    outputLines
  };
}
