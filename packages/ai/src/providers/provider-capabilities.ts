export interface ProviderCapabilities {
  structuredOutput: boolean;
  localRuntime: boolean;
  markdownTranslation: boolean;
  jsonMode: boolean;
  modelListing: boolean;
}

export const DEFAULT_REMOTE_PROVIDER_CAPABILITIES: ProviderCapabilities = {
  structuredOutput: true,
  localRuntime: false,
  markdownTranslation: true,
  jsonMode: true,
  modelListing: true
};

export const DEFAULT_LOCAL_PROVIDER_CAPABILITIES: ProviderCapabilities = {
  structuredOutput: true,
  localRuntime: true,
  markdownTranslation: true,
  jsonMode: true,
  modelListing: true
};

export const ANTHROPIC_PROVIDER_CAPABILITIES: ProviderCapabilities = {
  structuredOutput: true,
  localRuntime: false,
  markdownTranslation: true,
  jsonMode: false,
  modelListing: true
};

export const MINIMAX_PROVIDER_CAPABILITIES: ProviderCapabilities = {
  structuredOutput: true,
  localRuntime: false,
  markdownTranslation: true,
  jsonMode: true,
  modelListing: false
};
