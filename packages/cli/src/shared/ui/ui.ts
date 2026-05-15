import React from "react";
import { Box, Text } from "ink";
import { CliBanner } from "../../components/cli-banner.js";

export function createSection(title: string, lines: React.ReactElement[]): React.ReactElement {
  return React.createElement(
    Box,
    { flexDirection: "column", borderStyle: "round", borderColor: "cyan", paddingX: 1, paddingY: 0 },
    React.createElement(CliBanner, {}),
    React.createElement(Text, { color: "cyanBright" }, title),
    React.createElement(Box, { marginTop: 1, flexDirection: "column" }, ...lines)
  );
}

export function createLine(text: string, color?: Parameters<typeof Text>[0]["color"], key?: string): React.ReactElement {
  return React.createElement(Text, { key: key ?? text, ...(color ? { color } : {}) }, text);
}
