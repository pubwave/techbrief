import type { WizardLocale } from "../../shared/i18n/wizard/index.js";
import { prepareMobileWorkspace } from "./workflow/mobile-run-workflow.js";
import type {
  MobileInstallableDevice,
  MobileProgressCallbacks,
  MobileRunInput,
  MobileRunResult
} from "./types.js";

export interface MobileRunState {
  stagedCleanup: (() => Promise<void>) | null;
  stagedTempRoot: string;
  steps: MobileRunResult["steps"];
  cleanupPerformed: boolean;
  selectedDevice: MobileInstallableDevice | undefined;
  activeWorkspaceDir: string;
  activeMobileDir: string;
  templateReference: string;
}

export function createMobileRunState(input: MobileRunInput): MobileRunState {
  return {
    stagedCleanup: null,
    stagedTempRoot: "",
    steps: [],
    cleanupPerformed: false,
    selectedDevice: undefined,
    activeWorkspaceDir: "",
    activeMobileDir: "",
    templateReference: input.templateUrl ?? ""
  };
}

export async function finalizeMobileRun(
  input: MobileRunInput,
  state: MobileRunState,
  ok: boolean
): Promise<MobileRunResult> {
  if (!input.keepTemp && state.stagedCleanup) {
    await state.stagedCleanup();
    state.cleanupPerformed = true;
  }

  return {
    ok,
    tempRoot: state.stagedTempRoot,
    workspaceDir: state.activeWorkspaceDir,
    mobileDir: state.activeMobileDir,
    templateUrl: state.templateReference,
    cleanupPerformed: state.cleanupPerformed,
    steps: state.steps,
    ...(state.selectedDevice ? { selectedDevice: state.selectedDevice } : {})
  };
}

export async function prepareMobileWorkspaceState(
  input: MobileRunInput,
  callbacks: MobileProgressCallbacks | undefined,
  locale: WizardLocale,
  state: MobileRunState
): Promise<void> {
  const preparedWorkspace = await prepareMobileWorkspace({
    locale,
    runInput: input,
    ...(callbacks ? { callbacks } : {})
  });
  state.activeWorkspaceDir = preparedWorkspace.activeWorkspaceDir;
  state.activeMobileDir = preparedWorkspace.activeMobileDir;
  state.templateReference = preparedWorkspace.templateReference;
  state.stagedCleanup = preparedWorkspace.staged?.cleanup ?? null;
  state.stagedTempRoot = preparedWorkspace.staged?.tempRoot ?? "";
  state.steps.push({
    label: "template",
    ok: true,
    detail: preparedWorkspace.templateReference
  });
}
