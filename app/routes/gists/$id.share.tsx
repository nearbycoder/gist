import { Link, createFileRoute } from '@tanstack/react-router';
import { Suspense, useEffect, useState } from 'react';

import { Editor } from '@/components/Editor.client';
import { DiffViewer } from '@/components/DiffViewer.client';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { getPublicGist } from '@/serverFunctions/gists';
import { languageDisplayNames } from '@/config/languages';

export const Route = createFileRoute('/gists/$id/share')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const gist = await getPublicGist({
      data: {
        id: params.id,
      },
    });

    if (!gist) {
      throw new Error('Gist not found');
    }

    return gist;
  },
  errorComponent: ({ error }) => {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-3 text-center">
        <h1 className="text-4xl font-bold text-gray-100 mb-4">Oops!</h1>
        <p className="text-xl text-gray-200 mb-8">
          {error.message === 'Gist not found'
            ? "This gist doesn't exist or isn't public"
            : error.message}
        </p>
        <Link
          to="/auth/login"
          replace
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Go back home
        </Link>
      </div>
    );
  },
});

function RouteComponent() {
  const gist = Route.useLoaderData();
  const [version, setVersion] = useState(gist.versions[0]);
  const [compareVersion, setCompareVersion] = useState(gist.versions[1]);
  const [isDiffView, setIsDiffView] = useState(false);

  useEffect(() => {
    setVersion(gist.versions[0]);
    setCompareVersion(gist.versions[1]);
  }, [gist]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{gist.title}</h1>
          <div className="flex items-center space-x-2 mt-1">
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
              {gist.language
                ? languageDisplayNames[gist.language]
                : 'No language'}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-300">
              {gist.versions.length} version
              {gist.versions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="space-y-2">
          <Label htmlFor="version">
            {isDiffView ? 'New Version' : 'Version'}
          </Label>
          <Select
            value={version.id}
            onValueChange={(val) => {
              const ver = gist.versions.find((v) => v.id === val);
              if (ver) {
                setVersion(ver);
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Version" />
            </SelectTrigger>
            <SelectContent>
              {gist.versions.map((ver) => (
                <SelectItem key={ver.id} value={ver.id}>
                  Version {ver.version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {gist.versions.length > 1 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="diff-mode"
                checked={isDiffView}
                onCheckedChange={setIsDiffView}
              />
              <Label htmlFor="diff-mode">Compare versions</Label>
            </div>
            {isDiffView && (
              <div className="space-y-2">
                <Label htmlFor="compareVersion">Old Version</Label>
                <Select
                  value={compareVersion.id}
                  onValueChange={(val) => {
                    const ver = gist.versions.find((v) => v.id === val);
                    if (ver) {
                      setCompareVersion(ver);
                    }
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Compare Version" />
                  </SelectTrigger>
                  <SelectContent>
                    {gist.versions.map((ver) => (
                      <SelectItem key={ver.id} value={ver.id}>
                        Version {ver.version}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="border rounded-lg h-[calc(100vh-250px)]">
        <Suspense fallback={<div></div>}>
          {isDiffView ? (
            <DiffViewer
              oldVersion={compareVersion.body}
              newVersion={version.body}
              language={gist.language || 'typescript'}
            />
          ) : (
            <Editor
              value={version.body}
              onChange={() => {}}
              language={gist.language || 'typescript'}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}
