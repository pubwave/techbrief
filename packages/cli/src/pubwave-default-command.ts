import React from "react";
import type { DefaultCommandHook } from "@pubwave/cli";
import type { AppConfig } from "@techbrief/shared";
import { techbriefAdditionalRows } from "./pubwave-saved-view.js";

export const techbriefDefaultCommand: DefaultCommandHook<AppConfig> = (ctx) => {
  if (ctx.hasSavedSetupConfig) {
    return ctx.renderSavedView({
      additionalRows: (savedCtx) => techbriefAdditionalRows(savedCtx)
    });
  }
  return ctx.renderSetupWizard();
};

export const techbriefPubwaveDefaultCommand: DefaultCommandHook<AppConfig> = techbriefDefaultCommand;

// Keep React import live for tsx transpilation parity even if not directly used here.
void React;
