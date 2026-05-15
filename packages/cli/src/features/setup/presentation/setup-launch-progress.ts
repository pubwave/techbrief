import type { FlutterProgressEvent } from "../../mobile-install/workflow/flutter-sdk.js";
import { wizardMessage, type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import { stripTrailingDots } from "../helpers.js";

export function buildFlutterDownloadProgressText(locale: WizardLocale, event: FlutterProgressEvent): string {
  const baseText = stripTrailingDots(wizardMessage(locale, "progressMobileFlutterDownload"));
  const receivedBytes = event.receivedBytes ?? 0;

  if (!event.totalBytes || event.totalBytes <= 0) {
    return `${baseText}: ${formatMegabytes(receivedBytes)}`;
  }

  const percent = Math.min(100, Math.floor((receivedBytes / event.totalBytes) * 100));
  return `${baseText}: ${percent}% (${formatMegabytes(receivedBytes)} / ${formatMegabytes(event.totalBytes)})`;
}

function formatMegabytes(bytes: number): string {
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes.toFixed(megabytes >= 100 ? 0 : 1)} MB`;
}
