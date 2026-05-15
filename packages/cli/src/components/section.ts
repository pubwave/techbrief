import React from "react";
import { Box, Text } from "ink";
import { CliBanner } from "./cli-banner.js";

interface SectionProps {
  title?: string;
  children?: React.ReactNode;
  width?: number;
  height?: number;
  bordered?: boolean;
  showTitle?: boolean;
  contentGap?: number;
}

export function Section({
  title,
  children,
  width,
  height,
  bordered = true,
  showTitle = true,
  contentGap = 1
}: SectionProps): React.ReactElement {
  return React.createElement(
    Box,
    {
      flexDirection: "column",
      ...(bordered ? { borderStyle: "round" as const, borderColor: "cyan" as const } : {}),
      paddingX: 1,
      paddingY: 0,
      alignSelf: "flex-start",
      width,
      height
    },
    React.createElement(CliBanner, width ? { width } : {}),
    ...(showTitle && title
      ? [React.createElement(Text, { key: "section-title", color: "cyanBright" }, title)]
      : []),
    React.createElement(
      Box,
      {
        marginTop: showTitle && title ? contentGap : 0,
        flexDirection: "column"
      },
      children
    )
  );
}
