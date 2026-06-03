import React from "react";
import { addCustomSource, listAllSources, updateSourceState } from "@techbrief/runtime";
import { validateCustomSource } from "@techbrief/ingest";
import { createLine, createSection } from "../../shared/ui/ui.js";
import { resolveCategory } from "../shared/helpers.js";

export async function sourceListView(): Promise<React.ReactElement> {
  const sources = await listAllSources();
  const header = [
    createLine(`Total: ${sources.length}`, undefined, "total"),
    createLine(`tech-news: ${sources.filter((source) => source.category === "tech-news").length}`, "cyan", "tech"),
    createLine(`indie-dev: ${sources.filter((source) => source.category === "indie-dev").length}`, "green", "indie")
  ];
  const preview = sources.slice(0, 16).map((source) =>
    createLine(`- ${source.name} [${source.category}] (${source.state} · ${source.discoveryMethod})`, undefined, source.id)
  );

  return createSection("Sources", [...header, ...preview]);
}

export async function sourceValidateView(options: Record<string, string | boolean>): Promise<React.ReactElement> {
  const input = {
    name: String(options.name ?? "Custom Source"),
    homepage: String(options.url ?? "https://example.com"),
    category: resolveCategory(options.category),
    ...(typeof options.feed === "string" ? { feedUrl: options.feed } : {}),
    discoveryMethodPreference: "auto" as const
  };
  const result = validateCustomSource(input);

  return createSection("Source Validate", [
    createLine(`Selected category: ${result.declaredCategory}`),
    createLine(`Inferred category: ${result.inferredCategory}`, "cyan"),
    createLine(`Result: ${result.accepted ? "accepted" : "rejected"}`, result.accepted ? "green" : "red"),
    ...(result.issues.length === 0
      ? [createLine("No blocking issues detected.", "green")]
      : result.issues.map((issue) => createLine(`- ${issue.message}`, "red", issue.code)))
  ]);
}

export async function sourceAddView(options: Record<string, string | boolean>): Promise<React.ReactElement> {
  const result = await addCustomSource({
    name: String(options.name ?? "Custom Source"),
    homepage: String(options.url ?? "https://example.com"),
    category: resolveCategory(options.category),
    ...(typeof options.feed === "string" ? { feedUrl: options.feed } : {}),
    discoveryMethodPreference: "auto"
  });

  return createSection("Source Add", [
    createLine(`Source: ${result.source.name}`),
    createLine(`Declared category: ${result.validation.declaredCategory}`),
    createLine(`Result: ${result.validation.accepted ? "accepted" : "rejected"}`, result.validation.accepted ? "green" : "red"),
    ...(result.validation.issues.length === 0
      ? [createLine("Source persisted to local registry.", "green")]
      : result.validation.issues.map((issue) => createLine(`- ${issue.message}`, "red", issue.code)))
  ]);
}

export async function sourceStateView(state: "enabled" | "disabled", options: Record<string, string | boolean>): Promise<React.ReactElement> {
  const sourceId = typeof options.id === "string" ? options.id : "";
  const updated = await updateSourceState(sourceId, state);

  return createSection(state === "enabled" ? "Source Enabled" : "Source Disabled", [
    createLine(updated ? `Source ${updated.id} -> ${updated.state}` : `Source '${sourceId}' was not found.`, updated ? "green" : "red")
  ]);
}
