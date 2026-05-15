import React from "react";
import { Box, Text } from "ink";
import { padStatusText, statusRowContentWidth } from "../layout.js";

interface SetupTextInputProps {
  value: string;
  width: number;
  masked?: boolean;
}

export function SetupTextInput({ value, width, masked = false }: SetupTextInputProps): React.ReactElement {
  const contentWidth = statusRowContentWidth(width);
  const displayValue = value.length > 0
    ? (masked ? "•".repeat(value.length) : value)
    : "";
  const prompt = `› ${displayValue}${value.length > 0 ? "" : " "}`;

  return (
    <Box flexDirection="column">
      <Text color="green">{padStatusText(prompt, contentWidth)}</Text>
    </Box>
  );
}
