export interface SourceContentProfile {
  preserveImages: boolean;
  extractEmbeds: boolean;
  extractTables: boolean;
  leadImagePlacement: "before-body" | "after-body";
}

const DEFAULT_PROFILE: SourceContentProfile = {
  preserveImages: true,
  extractEmbeds: true,
  extractTables: true,
  leadImagePlacement: "before-body"
};

const PROFILE_OVERRIDES: Record<string, Partial<SourceContentProfile>> = {
  "hackernews-frontpage": {
    preserveImages: false,
    extractEmbeds: false,
    extractTables: false
  },
  "hackernews-show-hn": {
    preserveImages: false,
    extractEmbeds: false,
    extractTables: false
  },
  "hackernews-launch-hn": {
    preserveImages: false,
    extractEmbeds: false,
    extractTables: false
  }
};

export function resolveSourceContentProfile(sourceId: string): SourceContentProfile {
  return {
    ...DEFAULT_PROFILE,
    ...(PROFILE_OVERRIDES[sourceId] ?? {})
  };
}
