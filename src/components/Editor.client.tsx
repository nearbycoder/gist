'use client';

import { Suspense, lazy } from 'react';
import githubdark from './editor-themes/githubdark';
import githublight from './editor-themes/githublight';
import { useResolvedTheme } from './ThemeToggle';
import type { Monaco } from '@monaco-editor/react';

const MonacoEditor = lazy(() =>
  import('@monaco-editor/react').then((mod) => ({ default: mod.Editor }))
);

export function Editor({
  language,
  value,
  onChange,
  minimal = false,
  theme = 'auto',
}: {
  language: string;
  value: string;
  onChange?: (v: string | undefined) => void;
  minimal?: boolean;
  theme?: 'auto' | 'dark' | 'light';
}) {
  const resolvedTheme = useResolvedTheme();

  const handleEditorDidMount = (monaco: Monaco) => {
    monaco.editor.defineTheme('GitHubDark', githubdark as any);
    monaco.editor.defineTheme('GitHubLight', githublight as any);
  };

  const editorTheme =
    theme === 'auto'
      ? resolvedTheme === 'dark'
        ? 'GitHubDark'
        : 'GitHubLight'
      : theme === 'dark'
        ? 'GitHubDark'
        : 'GitHubLight';

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
        theme={editorTheme}
        onChange={(code) => {
          onChange?.(code);
        }}
        height="100%"
        language={language}
        options={{
          minimap: {
            enabled: !minimal,
          },
          fontSize: 18,
          formatOnPaste: !onChange,
          formatOnType: !onChange,
          readOnly: !onChange,
          lineNumbers: !minimal ? 'on' : 'off',
          folding: !minimal,
          scrollBeyondLastLine: !minimal,
          renderLineHighlight: minimal ? 'none' : 'all',
        }}
      />
    </Suspense>
  );
}
