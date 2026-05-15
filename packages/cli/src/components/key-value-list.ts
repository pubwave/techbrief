import React from "react";
import { Box, Text } from "ink";

interface KeyValueListProps {
  items: Array<{ label: string; value: string }>;
}

export function KeyValueList({ items }: KeyValueListProps): React.ReactElement {
  return React.createElement(
    Box,
    { flexDirection: "column" },
    ...items.map((item) =>
      React.createElement(
        Box,
        { key: item.label },
        React.createElement(Box, { width: 20 }, React.createElement(Text, { color: "gray" }, item.label)),
        React.createElement(Text, null, item.value)
      )
    )
  );
}
