import React from "react";
import { Box, Text } from "ink";
import { Section } from "../../../components/section.js";
import { padStatusText, statusRowContentWidth } from "../../setup/layout.js";
import { visibleChoiceWindow } from "../../setup/helpers.js";
import { wizardMessage, type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import type { MobileInstallableDevice } from "../index.js";

interface SetupMobileDeviceChoiceViewProps {
  cursorIndex: number;
  devices: MobileInstallableDevice[];
  height: number;
  locale: WizardLocale;
  selectedDeviceIds: string[];
  width: number;
}

export function SetupMobileDeviceChoiceView({
  cursorIndex,
  devices,
  height,
  locale,
  selectedDeviceIds,
  width
}: SetupMobileDeviceChoiceViewProps): React.ReactElement {
  const contentWidth = statusRowContentWidth(width);
  const visibleRows = visibleChoiceWindow(devices, cursorIndex, Math.max(3, height - 7));
  const selectedIds = new Set(selectedDeviceIds);

  return (
    <Section title={wizardMessage(locale, "firstRunTitle")} width={width} height={height} bordered={false} showTitle={false}>
      <Box flexDirection="column">
        <Text>{wizardMessage(locale, "mobileDeviceChoiceTitle")}</Text>
        <Text color="gray">{wizardMessage(locale, "mobileDeviceChoiceHint")}</Text>
      </Box>
      <Box marginTop={1} flexDirection="column" flexGrow={1}>
        {visibleRows.hasHiddenAbove ? <Text color="gray">{padStatusText("↑", contentWidth)}</Text> : null}
        {visibleRows.items.map((device, index) => {
          const absoluteIndex = visibleRows.startIndex + index;
          const checked = selectedIds.has(device.id);
          const current = absoluteIndex === cursorIndex;
          const marker = `${current ? ">" : " "} ${checked ? "[✓]" : "[x]"} ${device.label}`;
          const color = current ? "cyan" : checked ? "green" : null;

          return (
            <Text key={device.id} {...(color ? { color } : {})}>
              {padStatusText(marker, contentWidth)}
            </Text>
          );
        })}
        {visibleRows.hasHiddenBelow ? <Text color="gray">{padStatusText("↓", contentWidth)}</Text> : null}
      </Box>
      <Box marginTop={1}>
        <Text color="yellow">{wizardMessage(locale, "mobileDeviceChoiceNav")}</Text>
      </Box>
    </Section>
  );
}
