import React from "react";
import type { DefaultCommandHook } from "@pubwave/cli";
import type { AppConfig } from "@techbrief/shared";

export const techbriefDefaultCommand: DefaultCommandHook<AppConfig> = (ctx) => {
  if (ctx.hasSavedSetupConfig) {
    // Config rows come from features.setup.configRows, so the saved view and the
    // post-setup completion screen render the same full techbrief config.
    return ctx.renderSavedView();
  }
  return ctx.renderSetupWizard();
};

export const techbriefPubwaveDefaultCommand: DefaultCommandHook<AppConfig> = techbriefDefaultCommand;

// Keep React import live for tsx transpilation parity even if not directly used here.
void React;
