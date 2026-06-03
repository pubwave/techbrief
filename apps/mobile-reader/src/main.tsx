import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { JSONContent } from '@tiptap/core';
import type { EditorTheme } from '@pubwave/editor';
import { buildDetailDocument, type DetailDocumentInput } from '@techbrief/converter';
import App from './App.tsx';

let currentContent: JSONContent | null = null;
let currentTheme: EditorTheme | null = null;
let currentFontSize = 16;
let renderRoot: ReturnType<typeof createRoot> | null = null;

function render() {
  if (!renderRoot) return;
  renderRoot.render(
    <StrictMode>
      <App
        content={currentContent}
        theme={currentTheme}
        fontSize={currentFontSize}
      />
    </StrictMode>,
  );
}

// Expose global API before React mounts. The host passes a DetailDocumentInput
// (title + metadata + colored tags + body); we assemble the full editor document
// here with the same builder the web app uses, so the title, tags and body all
// render inside a single editor surface (the WebView then scrolls natively).
(window as Window & typeof globalThis & {
  setContent: (payloadJsonStr: string, themeJsonStr: string) => void;
  setFontSize: (px: number) => void;
}).setContent = function (payloadJsonStr: string, themeJsonStr: string) {
  try {
    const input = JSON.parse(payloadJsonStr) as DetailDocumentInput;
    currentContent = buildDetailDocument(input) as unknown as JSONContent;
  } catch {
    currentContent = null;
  }
  try {
    currentTheme = JSON.parse(themeJsonStr) as EditorTheme;
  } catch {
    currentTheme = null;
  }
  render();
};

(window as Window & typeof globalThis & {
  setContent: (payloadJsonStr: string, themeJsonStr: string) => void;
  setFontSize: (px: number) => void;
}).setFontSize = function (px: number) {
  currentFontSize = px;
  render();
};

const container = document.getElementById('root');
if (container) {
  renderRoot = createRoot(container);
  render();
}
