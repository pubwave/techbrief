import type { CloudProviderCatalogEntry } from "./cloud-shared.js";

const models = [
  { label: "MiniMax M2.7", value: "MiniMax-M2.7", description: "Newest strong MiniMax general-purpose model for coding and agent tasks." },
  { label: "MiniMax M2.6", value: "MiniMax-M2.6", description: "", descriptionKey: "cloud-balanced-default" },
  { label: "MiniMax M2.5", value: "MiniMax-M2.5", description: "Strong prior-generation MiniMax default with broad coding support." },
  { label: "MiniMax M2.5 High Speed", value: "MiniMax-M2.5-highspeed", description: "Faster MiniMax variant when you want lower latency." },
  { label: "MiniMax M1", value: "MiniMax-M1", description: "", descriptionKey: "cloud-reasoning-model" },
  { label: "MiniMax Text 01", value: "MiniMax-Text-01", description: "", descriptionKey: "cloud-legacy-stable" },
  { label: "MiniMax Text 01 Preview", value: "MiniMax-Text-01-preview", description: "", descriptionKey: "cloud-preview-model" },
  { label: "MiniMax VL 01", value: "MiniMax-VL-01", description: "", descriptionKey: "cloud-multimodal-model" },
  { label: "MiniMax Speech 02", value: "MiniMax-Speech-02", description: "", descriptionKey: "cloud-specialized-model" },
  { label: "MiniMax Music 01", value: "MiniMax-Music-01", description: "", descriptionKey: "cloud-specialized-model" }
];

export const miniMaxCatalog: CloudProviderCatalogEntry = {
  label: "MiniMax",
  value: "minimax",
  description: "Hosted MiniMax text models with strong coding and agent performance.",
  models
};
