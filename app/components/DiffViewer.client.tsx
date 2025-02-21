'use client';

import { Suspense, lazy } from 'react';
import { useThemeStore } from './ThemeToggle';
import githubdark from './editor-themes/githubdark';
import githublight from './editor-themes/githublight';
import type { Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

const MonacoEditor = lazy(() =>
  import('@monaco-editor/react').then((mod) => ({ default: mod.DiffEditor }))
);

interface DiffViewerProps {
  oldVersion: string;
  newVersion: string;
  language?: string;
}

export function DiffViewer({
  oldVersion,
  newVersion,
  language = 'typescript',
}: DiffViewerProps) {
  const { mode } = useThemeStore();

  const handleEditorDidMount = (monaco: Monaco) => {
    monaco.editor.defineTheme(
      'GitHubDark',
      githubdark as editor.IStandaloneThemeData
    );
    monaco.editor.defineTheme(
      'GitHubLight',
      githublight as editor.IStandaloneThemeData
    );
  };

  return (
    <div className="h-full">
      <Suspense fallback={<div></div>}>
        <MonacoEditor
          beforeMount={handleEditorDidMount}
          original={oldVersion}
          modified={newVersion}
          theme={
            mode === 'dark' || mode === 'auto' ? 'GitHubDark' : 'GitHubLight'
          }
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
    </div>
  );
}
