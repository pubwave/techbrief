import React from "react";
import { Box, Text } from "ink";
import { Section } from "../../components/section.js";

const checks = [
  { name: "Node.js >= 20", status: "required" },
  { name: "Docker", status: "required for web" },
  { name: "Flutter", status: "required for mobile" },
  { name: "Android SDK", status: "required for Android" },
  { name: "Xcode", status: "required for iOS on macOS" }
];

export function DoctorCommand(): React.ReactElement {
  return React.createElement(
    Section,
    { title: "Doctor" },
    React.createElement(Text, { color: "yellow" }, "This is the initial diagnostic surface. Real environment checks come next."),
    React.createElement(
      Box,
      { marginTop: 1, flexDirection: "column" },
      ...checks.map((check) =>
        React.createElement(Text, { key: check.name }, `- ${check.name}: ${check.status}`)
      )
    )
  );
}
