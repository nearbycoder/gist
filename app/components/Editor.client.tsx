'use client';

import { Suspense, lazy } from 'react';
import githubdark from './editor-themes/githubdark';
import githublight from './editor-themes/githublight';
import { useThemeStore } from './ThemeToggle';
import type { Monaco } from '@monaco-editor/react';

const MonacoEditor = lazy(() =>
  import('@monaco-editor/react').then((mod) => ({ default: mod.Editor }))
);

export function Editor({
  language,
  value,
  onChange,
}: {
  language: string;
  value: string;
  onChange: (v: string | undefined) => void;
}) {
  const { mode } = useThemeStore();

  const handleEditorDidMount = (monaco: Monaco) => {
    monaco.editor.defineTheme('GitHubDark', githubdark);
    monaco.editor.defineTheme('GitHubLight', githublight);
  };

  return (
    <Suspense fallback={<div></div>}>
      <MonacoEditor
        beforeMount={handleEditorDidMount}
        onMount={(editor, monaco) => {
          monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
          });

          monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            jsx: 4,
          });

          monaco.editor.addKeybindingRule({
            keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            command: 'editor.action.formatDocument',
          });
        }}
        value={value}
        theme={
          mode === 'dark' || mode === 'auto' ? 'GitHubDark' : 'GitHubLight'
        }
        onChange={(code) => {
          onChange(code);
        }}
        height="100%"
        language={language}
        options={{
          minimap: {
            enabled: false,
          },
          fontSize: 18,
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </Suspense>
  );
}
