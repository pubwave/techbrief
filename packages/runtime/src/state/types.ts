import type { AppConfig, SourceDefinition } from "@techbrief/shared";

export interface RuntimeState {
  config: AppConfig;
  customSources: SourceDefinition[];
}
