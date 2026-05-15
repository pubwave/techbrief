import React from "react";
import { Box, Text } from "ink";
import type { ContentType } from "@techbrief/shared";
import { validateCustomSource } from "@techbrief/ingest";
import { Section } from "../../components/section.js";

interface SourceAddCommandProps {
  name: string;
  homepage: string;
  category: ContentType;
  feedUrl?: string;
}

export function SourceAddCommand({ name, homepage, category, feedUrl }: SourceAddCommandProps): React.ReactElement {
  const input = {
    name,
    homepage,
    category,
    discoveryMethodPreference: "auto"
  } as const;
  const result = validateCustomSource(feedUrl ? { ...input, feedUrl } : input);

  return React.createElement(
    Section,
    { title: "Source Add" },
    React.createElement(Text, null, `Selected category: ${category}`),
    React.createElement(Text, { color: result.accepted ? "green" : "red" }, `Validation result: ${result.accepted ? "accepted" : "rejected"}`),
    React.createElement(
      Box,
      { marginTop: 1, flexDirection: "column" },
      ...(result.issues.length === 0
        ? [React.createElement(Text, { key: "success", color: "green" }, "No blocking issues detected.")]
        : result.issues.map((issue) =>
            React.createElement(Text, { key: issue.code, color: "red" }, `- ${issue.message}`)
          ))
    )
  );
}
