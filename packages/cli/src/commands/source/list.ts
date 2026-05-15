import React from "react";
import { Box, Text } from "ink";
import { DEFAULT_SOURCES } from "@techbrief/shared";
import { Section } from "../../components/section.js";

export function SourceListCommand(): React.ReactElement {
  const techNewsCount = DEFAULT_SOURCES.filter((source) => source.category === "tech-news").length;
  const indieDevCount = DEFAULT_SOURCES.filter((source) => source.category === "indie-dev").length;

  return React.createElement(
    Section,
    { title: "Sources" },
    React.createElement(Text, null, `Total: ${DEFAULT_SOURCES.length}`),
    React.createElement(Text, { color: "cyan" }, `tech-news: ${techNewsCount}`),
    React.createElement(Text, { color: "green" }, `indie-dev: ${indieDevCount}`),
    React.createElement(
      Box,
      { marginTop: 1, flexDirection: "column" },
      ...DEFAULT_SOURCES.slice(0, 12).map((source) =>
        React.createElement(Text, { key: source.id }, `- ${source.name} [${source.category}]`)
      )
    )
  );
}
