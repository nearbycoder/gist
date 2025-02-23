import { Link, createFileRoute, useRouter } from '@tanstack/react-router';
import { Suspense, useEffect, useState } from 'react';

import { Code2, GitCompare, GitFork } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { forkGist, getPublicGist } from '@/serverFunctions/gists';
import { languageDisplayNames } from '@/config/languages';
import { cn } from '@/lib/utils';

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
  head: ({ loaderData: gist }) => {
    const ogImageUrl = `/api/og/${gist.id}`;
    const userName =
      gist.user.name || gist.user.email.split('@')[0] || 'Anonymous';
    const description = `${gist.language ? languageDisplayNames[gist.language] : 'Text'} gist by ${userName} with ${gist.versions.length} version${gist.versions.length !== 1 ? 's' : ''}`;

    return {
      title: gist.title,
      meta: [
        {
          name: 'description',
          content: description,
        },
        {
          property: 'og:title',
          content: gist.title,
        },
        {
          property: 'og:description',
          content: description,
        },
        {
          property: 'og:image',
          content: ogImageUrl,
        },
        {
          property: 'og:image:width',
          content: '1200',
        },
        {
          property: 'og:image:height',
          content: '630',
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
        {
          name: 'twitter:title',
          content: gist.title,
        },
        {
          name: 'twitter:description',
          content: description,
        },
        {
          name: 'twitter:image',
          content: ogImageUrl,
        },
      ],
    };
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
  const router = useRouter();
  const [version, setVersion] = useState(gist.versions[0]);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersion, setCompareVersion] = useState<typeof version | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setVersion(gist.versions[0]);
    setCompareVersion(null);
    setCompareMode(false);
  }, [gist]);

  const handleFork = async () => {
    try {
      const forkedGist = await forkGist({
        data: {
          gistId: gist.id,
        },
      });

      router.navigate({
        to: `/gists/${forkedGist.id}`,
      });
    } catch (error) {
      if (error.message === 'Unauthorized') {
        router.navigate({
          to: '/auth/login',
          search: {
            redirect: window.location.pathname,
          },
        });
        return;
      }
      console.error('Failed to fork gist:', error);
      alert('Failed to fork gist. Please try again.');
    }
  };

  const handleCopyEmbed = () => {
    const embedUrl = `${window.location.origin}/gists/${gist.id}/embed`;
    const embedCode = `<iframe src="${embedUrl}" style="width: 100%; height: 500px; border: 0;"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            <span className="text-gray-600 dark:text-gray-300">
              {gist.versions.length} version
              {gist.versions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {gist.versions.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCompareMode(!compareMode)}
              className={cn(
                'transition-colors',
                compareMode && 'text-blue-500 hover:text-blue-600'
              )}
            >
              <GitCompare className="w-4 h-4" />
            </Button>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleCopyEmbed}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <Code2 className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {copied ? 'Copied!' : 'Embed'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy embed code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            onClick={handleFork}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <GitFork className="w-4 h-4" />
            <span className="hidden sm:inline">Fork</span>
          </Button>
        </div>
      </div>
      <div className={cn('space-y-2', compareMode && 'flex gap-4')}>
        <div className={compareMode ? 'flex-1' : undefined}>
          <Label htmlFor="version">Version</Label>
          <Select
            value={version.id}
            onValueChange={(val) => {
              const ver = gist.versions.find((v) => v.id === val);
              if (ver) {
                setVersion(ver);
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
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
        {compareMode && (
          <div className="flex-1">
            <Label htmlFor="compareVersion">Compare with</Label>
            <Select
              value={compareVersion?.id || ''}
              onValueChange={(val) => {
                const ver = gist.versions.find((v) => v.id === val);
                if (ver) {
                  setCompareVersion(ver);
                }
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {gist.versions
                  .filter((v) => v.id !== version.id)
                  .map((ver) => (
                    <SelectItem key={ver.id} value={ver.id}>
                      Version {ver.version}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="border rounded-lg h-[calc(100vh-250px)]">
        <Suspense fallback={<div></div>}>
          {compareMode && compareVersion ? (
            <DiffViewer
              oldVersion={compareVersion.body}
              newVersion={version.body}
              language={gist.language || 'typescript'}
            />
          ) : (
            <Editor
              value={version.body}
              language={gist.language || 'typescript'}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}
