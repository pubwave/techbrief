import type { CloudProviderCatalogEntry } from "./cloud-shared.js";

const models = [
  { label: "Gemini 2.5 Pro", value: "gemini-2.5-pro", description: "", descriptionKey: "cloud-latest-flagship" },
  { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash", description: "", descriptionKey: "cloud-balanced-default" },
  { label: "Gemini 2.5 Flash-Lite", value: "gemini-2.5-flash-lite", description: "", descriptionKey: "cloud-fast-latest" },
  { label: "Gemini 2.5 Pro Preview TTS", value: "gemini-2.5-pro-preview-tts", description: "", descriptionKey: "cloud-preview-model" },
  { label: "Gemini 2.5 Flash Preview TTS", value: "gemini-2.5-flash-preview-tts", description: "", descriptionKey: "cloud-preview-model" },
  { label: "Gemini 2.5 Flash Native Audio", value: "gemini-2.5-flash-preview-native-audio-dialog", description: "", descriptionKey: "cloud-multimodal-model" },
  { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash", description: "", descriptionKey: "cloud-fast-stable" },
  { label: "Gemini 2.0 Flash-Lite", value: "gemini-2.0-flash-lite", description: "", descriptionKey: "cloud-fast-stable" },
  { label: "Gemini 1.5 Pro", value: "gemini-1.5-pro", description: "", descriptionKey: "cloud-legacy-stable" },
  { label: "Gemini 1.5 Flash", value: "gemini-1.5-flash", description: "", descriptionKey: "cloud-legacy-stable" }
];

export const googleCatalog: CloudProviderCatalogEntry = {
  label: "Google",
  value: "google",
  description: "",
  descriptionKey: "google",
  models
};
