import React from "react";
import { Box, Text } from "ink";

const GLYPHS: Record<string, string[]> = {
  T: ["███████", "  ███  ", "  ███  ", "  ███  ", "  ███  "],
  E: ["███████", "██     ", "██████ ", "██     ", "███████"],
  C: [" ██████", "██     ", "██     ", "██     ", " ██████"],
  H: ["██   ██", "██   ██", "███████", "██   ██", "██   ██"],
  B: ["██████ ", "██   ██", "██████ ", "██   ██", "██████ "],
  R: ["██████ ", "██   ██", "██████ ", "██  ██ ", "██   ██"],
  I: ["███████", "  ███  ", "  ███  ", "  ███  ", "███████"],
  F: ["███████", "██     ", "██████ ", "██     ", "██     "]
};

const LEFT_WORD = ["T", "E", "C", "H"];
const RIGHT_WORD = ["B", "R", "I", "E", "F"];
const LARGE_BANNER_MIN_WIDTH = 62;

interface CliBannerProps {
  width?: number;
}

export function CliBanner({ width }: CliBannerProps): React.ReactElement {
  if (!width || width < LARGE_BANNER_MIN_WIDTH) {
    return (
      <Box marginBottom={1}>
        <Text color="#e6edf7">Tech</Text>
        <Text color="#55e2ff">Brief</Text>
      </Box>
    );
  }

  const leftRows = buildRows(LEFT_WORD);
  const rightRows = buildRows(RIGHT_WORD);

  return (
    <Box marginBottom={1} flexDirection="column">
      {leftRows.map((leftRow, index) => (
        <Box key={`banner-row-${index}`}>
          <Text color={leftRowColor(index)}>{leftRow}</Text>
          <Text>   </Text>
          <Text color={rightRowColor(index)}>{rightRows[index] ?? ""}</Text>
        </Box>
      ))}
    </Box>
  );
}

function buildRows(letters: string[]): string[] {
  return Array.from({ length: 5 }, (_, rowIndex) =>
    letters
      .map((letter) => GLYPHS[letter]?.[rowIndex] ?? "       ")
      .join(" ")
      .replace(/\s+$/, "")
  );
}

function leftRowColor(index: number): string {
  return ["#ffffff", "#f3f7fd", "#e5eef9", "#d4e2f2", "#bfd3e8"][index] ?? "#e5eef9";
}

function rightRowColor(index: number): string {
  return ["#f0feff", "#c8f8ff", "#84ebff", "#39d4ff", "#00b6ff"][index] ?? "#84ebff";
}
