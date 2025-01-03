import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';
import { Suspense, useEffect, useState } from 'react';

import { prisma } from '@/libs/db';
import { Editor } from '@/components/Editor';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const getGist = createServerFn()
  .validator(
    zodValidator(
      z.object({
        id: z.string(),
      })
    )
  )
  .handler(async ({ data }) => {
    const gist = await prisma.gist.findUnique({
      where: { id: data.id, isPublic: true },
      include: {
        versions: {
          orderBy: {
            version: 'desc',
          },
        },
      },
    });

    return gist;
  });

export const Route = createFileRoute('/gists/$id/share')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const gist = await getGist({
      data: {
        id: params.id,
      },
    });

    if (!gist) {
      throw redirect({
        to: '/',
        replace: true,
      });
    }

    return gist;
  },
  errorComponent: ({ error }) => {
    console.log(error);
    return <div>Error: {error.message}</div>;
  },
});

function RouteComponent() {
  const gist = Route.useLoaderData();
  const [version, setVersion] = useState(gist.versions[0]);

  useEffect(() => {
    setVersion(gist.versions[0]);
  }, [gist]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{gist.title}</h1>
          <div className="flex items-center space-x-2 mt-1">
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
              {gist.language}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-300">
              {gist.versions.length} version
              {gist.versions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
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
      <div className="border rounded-lg h-[calc(100vh-250px)]">
        <Suspense fallback={<div></div>}>
          <Editor
            value={version?.body}
            onChange={() => {}}
            language={gist.language || 'typescript'}
          />
        </Suspense>
      </div>
    </div>
  );
}
