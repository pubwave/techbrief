import type { MobileWorkspace, MobileWorkspaceProvider } from "@pubwave/cli";
import { stageTemplateArchive, type StagedTemplate } from "./shared/runtime/template.js";

export interface TemplateArchiveOptions {
  templateUrl?: string;
  keepTemp?: boolean;
}

interface TemplateMobileWorkspace extends MobileWorkspace {
  __staged: StagedTemplate;
}

function isStagedWorkspace(workspace: MobileWorkspace): workspace is TemplateMobileWorkspace {
  return Object.prototype.hasOwnProperty.call(workspace, "__staged");
}

export function templateArchive(options: TemplateArchiveOptions = {}): MobileWorkspaceProvider {
  return {
    async resolve() {
      const staged = await stageTemplateArchive(options.templateUrl);
      const workspace: TemplateMobileWorkspace = {
        projectDir: staged.mobileDir,
        __staged: staged
      };
      return workspace;
    },
    async cleanup(workspace) {
      if (options.keepTemp) return;
      if (isStagedWorkspace(workspace)) {
        await workspace.__staged.cleanup();
      }
    }
  };
}
