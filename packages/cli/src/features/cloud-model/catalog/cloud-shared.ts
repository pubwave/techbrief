export interface CloudCatalogModelChoice {
  label: string;
  value: string;
  description: string;
  descriptionKey?: string;
}

export interface CloudProviderCatalogEntry extends CloudCatalogModelChoice {
  models: CloudCatalogModelChoice[];
}
