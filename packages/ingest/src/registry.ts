import { DEFAULT_SOURCES, type CustomSourceInput, type SourceDefinition, type SourceValidationResult } from "@techbrief/shared";
import { toCustomSourceDefinition, validateCustomSource } from "./validate-source.js";

export interface AddSourceResult {
  source: SourceDefinition;
  validation: SourceValidationResult;
}

export class SourceRegistry {
  readonly #sources = new Map<string, SourceDefinition>();

  constructor(seed: SourceDefinition[] = DEFAULT_SOURCES) {
    for (const source of seed) {
      this.#sources.set(source.id, source);
    }
  }

  list(): SourceDefinition[] {
    return [...this.#sources.values()];
  }

  listByCategory(category: SourceDefinition["category"]): SourceDefinition[] {
    return this.list().filter((source) => source.category === category);
  }

  get(sourceId: string): SourceDefinition | undefined {
    return this.#sources.get(sourceId);
  }

  addCustomSource(input: CustomSourceInput): AddSourceResult {
    const validation = validateCustomSource(input);
    const source = toCustomSourceDefinition(input);

    if (validation.accepted) {
      this.#sources.set(source.id, source);
    }

    return { source, validation };
  }
}
