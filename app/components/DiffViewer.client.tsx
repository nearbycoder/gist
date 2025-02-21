'use client';

import { useEffect, useState } from 'react';
import { diffLines } from 'diff';
import { cn } from '@/lib/utils';

interface DiffViewerProps {
  oldVersion: string;
  newVersion: string;
  language?: string;
}

export function DiffViewer({
  oldVersion,
  newVersion,
  language,
}: DiffViewerProps) {
  const [diff, setDiff] = useState<
    Array<{ value: string; added?: boolean; removed?: boolean }>
  >([]);

  useEffect(() => {
    const differences = diffLines(oldVersion, newVersion);
    setDiff(differences);
  }, [oldVersion, newVersion]);

  return (
    <pre className="p-4 font-mono text-sm overflow-auto">
      {diff.map((part, index) => (
        <div
          key={index}
          className={cn(
            'whitespace-pre',
            part.added && 'bg-green-950/30 text-green-400',
            part.removed && 'bg-red-950/30 text-red-400'
          )}
        >
          {part.value}
        </div>
      ))}
    </pre>
  );
}
