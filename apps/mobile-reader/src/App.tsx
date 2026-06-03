import { useEffect } from 'react';
import { PubwaveEditor } from '@pubwave/editor';
import type { EditorTheme } from '@pubwave/editor';
import type { JSONContent } from '@tiptap/core';
import '@pubwave/editor/style.css';

interface AppProps {
  content: JSONContent | null;
  theme: EditorTheme | null;
  fontSize: number;
}

function App({ content, theme, fontSize }: AppProps) {
  const defaultTheme: EditorTheme = {
    colors: {
      background: 'transparent',
      text: '#eaf6ff',
      textMuted: '#5e7c91',
      border: 'transparent',
      primary: '#35d6ff',
      linkColor: '#35d6ff',
    },
    locale: 'zh-CN',
  };

  const effectiveTheme = theme ?? defaultTheme;

  // Drive the whole reader's type scale from one root size: headings use rem
  // (root-relative) and body text inherits the root, so a single value scales
  // both together (avoids the old split of px body vs rem headings).
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  return (
    <div style={{ width: '100%' }}>
      <PubwaveEditor
        editable={false}
        content={content ?? { type: 'doc', content: [] }}
        theme={effectiveTheme}
        width="100%"
      />
    </div>
  );
}

export default App;
