import React from "react";
import { Box, Text } from "ink";
import { padStatusText, statusRowContentWidth, wrapStatusText } from "../layout.js";

interface SetupMobileInstallDescriptionProps {
  description: string;
  width: number;
}

const LINE_COLORS = [
  "red",
  "cyan",
  "gray",
  "cyan",
  "gray",
  "gray",
  "yellow"
] as const;

export function SetupMobileInstallDescription({
  description,
  width
}: SetupMobileInstallDescriptionProps): React.ReactElement {
  const contentWidth = statusRowContentWidth(width);
  const lines = description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const rows = lines.flatMap((line, lineIndex) =>
    wrapStatusText(line, contentWidth, contentWidth).map((segment, segmentIndex) => ({
      key: `${lineIndex}-${segmentIndex}`,
      text: padStatusText(segment, contentWidth),
      color: LINE_COLORS[Math.min(lineIndex, LINE_COLORS.length - 1)] ?? "gray"
    }))
  );
  return (
    <Box flexDirection="column">
      {rows.map((row) => (
        <Text key={row.key} color={row.color}>
          {row.text}
        </Text>
      ))}
    </Box>
  );
}
