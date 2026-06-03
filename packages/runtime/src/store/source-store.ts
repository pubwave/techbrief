import {
  DEFAULT_SOURCES,
  toCustomSourceDefinition,
  validateCustomSource,
  type SourceItemConfig,
  type CustomSourceInput,
  type SourceDefinition
} from "@techbrief/shared";
import { getCustomSourcesFile } from "../fs/paths.js";
import { readJsonFile, writeJsonFile } from "../fs/json-file.js";
import { loadConfig, updateConfig } from "./config-store.js";

export async function loadCustomSources(): Promise<SourceDefinition[]> {
  return readJsonFile<SourceDefinition[]>(getCustomSourcesFile(), []);
}

export async function listAllSources(): Promise<SourceDefinition[]> {
  const [customSources, config] = await Promise.all([loadCustomSources(), loadConfig()]);
  const sources = [...DEFAULT_SOURCES, ...customSources];
  const sourceItems = await ensureSourceItemsConfig(sources, config.sources.items);
  return applySourceItemConfig(sources, sourceItems);
}

export async function addCustomSource(input: CustomSourceInput) {
  const customSources = await loadCustomSources();
  const validation = validateCustomSource(input);
  const source = toCustomSourceDefinition(input);
  const result = { source, validation };

  if (result.validation.accepted) {
    await writeJsonFile(getCustomSourcesFile(), [...customSources, result.source]);
    await setSourceEnabled(result.source.id, true);
  }

  return result;
}

export async function updateSourceState(sourceId: string, state: SourceDefinition["state"]): Promise<SourceDefinition | null> {
  const sources = await listAllSources();
  const existing = sources.find((source) => source.id === sourceId);

  if (!existing) {
    return null;
  }

  await setSourceEnabled(sourceId, state === "enabled");
  return { ...existing, state };
}

function applySourceItemConfig(sources: SourceDefinition[], sourceItems: Record<string, SourceItemConfig>): SourceDefinition[] {
  return sources.map((source) => {
    return { ...source, state: sourceItems[source.id]?.enabled === false ? "disabled" : "enabled" };
  });
}

async function ensureSourceItemsConfig(
  sources: SourceDefinition[],
  sourceItems: Record<string, SourceItemConfig>
): Promise<Record<string, SourceItemConfig>> {
  const missingSources = sources.filter((source) => !sourceItems[source.id]);

  if (missingSources.length === 0) {
    return sourceItems;
  }

  const missingItems = Object.fromEntries(
    missingSources.map((source) => [source.id, { enabled: true, priority: source.priority }])
  );
  const nextSourceItems = {
    ...sourceItems,
    ...missingItems
  };

  await updateConfig((current) => ({
    ...current,
    sources: {
      items: {
        ...current.sources.items,
        ...missingItems
      }
    }
  }));

  return nextSourceItems;
}

async function setSourceEnabled(sourceId: string, enabled: boolean): Promise<void> {
  await updateConfig((current) => ({
    ...current,
    sources: {
      items: {
        ...current.sources.items,
        // Preserve the existing priority when toggling enabled.
        [sourceId]: { priority: 0, ...current.sources.items[sourceId], enabled }
      }
    }
  }));
}
