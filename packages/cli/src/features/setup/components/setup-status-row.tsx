import React from "react";
import { Box, Text } from "ink";
import { displayWidth, wrapStatusText } from "../layout.js";

interface StatusRowProps {
  contentWidth: number;
  prefix: string;
  prefixColor: "green" | "yellow" | "cyan" | "red" | "gray";
  text: string;
  textColor: "green" | "yellow" | "cyan" | "red" | "gray";
  suffix?: string;
  suffixColor?: "green" | "yellow" | "cyan" | "red" | "gray";
}

export function StatusRow(input: StatusRowProps): React.ReactElement {
  const suffixText = input.suffix ? ` ${input.suffix}` : "";
  const firstLineWidth = Math.max(8, input.contentWidth - displayWidth(suffixText));
  const wrappedLines = wrapStatusText(input.text, firstLineWidth, input.contentWidth);

  return (
    <Box flexDirection="column">
      {wrappedLines.map((line, index) => (
        <Box key={`${input.prefix}-${index}`}>
          <Box width={3}>
            <Text color={index === 0 ? input.prefixColor : "gray"}>{index === 0 ? input.prefix : " "}</Text>
          </Box>
          <Text color={input.textColor}>{line}</Text>
          {index === 0 && input.suffix ? (
            <Text color={input.suffixColor ?? input.textColor}> {input.suffix}</Text>
          ) : null}
        </Box>
      ))}
    </Box>
  );
}
