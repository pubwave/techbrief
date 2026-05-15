import {
  DEFAULT_SOURCES,
  toCustomSourceDefinition,
  validateCustomSource,
  type CustomSourceInput,
  type SourceDefinition
} from "@techbrief/shared";
import { getCustomSourcesFile } from "../fs/paths.js";
import { readJsonFile, writeJsonFile } from "../fs/json-file.js";

export async function loadCustomSources(): Promise<SourceDefinition[]> {
  return readJsonFile<SourceDefinition[]>(getCustomSourcesFile(), []);
}

export async function listAllSources(): Promise<SourceDefinition[]> {
  const customSources = await loadCustomSources();
  return [...DEFAULT_SOURCES, ...customSources];
}

export async function addCustomSource(input: CustomSourceInput) {
  const customSources = await loadCustomSources();
  const validation = validateCustomSource(input);
  const source = toCustomSourceDefinition(input);
  const result = { source, validation };

  if (result.validation.accepted) {
    await writeJsonFile(getCustomSourcesFile(), [...customSources, result.source]);
  }

  return result;
}

export async function updateSourceState(sourceId: string, state: SourceDefinition["state"]): Promise<SourceDefinition | null> {
  const customSources = await loadCustomSources();
  const nextSources = customSources.map((source) => (source.id === sourceId ? { ...source, state } : source));
  const updated = nextSources.find((source) => source.id === sourceId);

  if (!updated) {
    return null;
  }

  await writeJsonFile(getCustomSourcesFile(), nextSources);
  return updated;
}
