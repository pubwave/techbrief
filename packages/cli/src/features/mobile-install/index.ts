import type { MobileProgressCallbacks, MobileRunInput, MobileRunResult } from "./types.js";
import { runMobileFromTemplate as runMobileFromTemplateFlow } from "./mobile-run.js";

export type {
  DeviceRunResult,
  MobileCheckStep,
  MobileInstallableDevice,
  MobilePlatform,
  MobileProgressCallbacks,
  MobileProgressStage,
  MobileReadinessResult,
  MobileRunInput,
  MobileRunResult
} from "./types.js";

export async function runMobileFromTemplate(
  input: MobileRunInput,
  callbacks?: MobileProgressCallbacks
): Promise<MobileRunResult> {
  return await runMobileFromTemplateFlow(input, callbacks);
}
