'use client';

import { Suspense, lazy } from 'react';

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
  return (
    <Suspense fallback={<div></div>}>
      <MonacoEditor
        value={value}
        theme="vs-dark"
        onChange={(code) => {
          onChange(code);
        }}
        height="100%"
        language={language}
        defaultValue="// some comment"
        options={{
          minimap: {
            enabled: false,
          },
          fontSize: 18,
        }}
      />
    </Suspense>
  );
}
