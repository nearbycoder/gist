import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { createServerFn } from '@tanstack/start';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';
import { getGist } from '.';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Editor } from '@/components/Editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { prisma } from '@/libs/db';
import { useAppSession } from '@/libs/session';
import { Switch } from '@/components/ui/switch';

export const Route = createFileRoute('/_dashboard/gists/$id/edit')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const gist = await getGist({
      data: {
        id: params.id,
      },
    });

    if (!gist) {
      throw new Error('Gist not found');
    }

    return gist;
  },
});
export const updateGist = createServerFn({ method: 'POST' })
  .validator(
    zodValidator(
      z.object({
        id: z.string(),
        title: z.string(),
        body: z.string(),
        language: z.string(),
        isPublic: z.boolean(),
      })
    )
  )
  .handler(async ({ data }) => {
    const session = await useAppSession();
    const user = await prisma.user.findUnique({
      where: { email: session.data.userEmail },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const versions = await prisma.version.findMany({
      where: { gistId: data.id },
      orderBy: {
        version: 'desc',
      },
    });

    const gist = await prisma.gist.update({
      where: { id: data.id, userId: user.id },
      data: {
        title: data.title,
        language: data.language,
        isPublic: data.isPublic,
      },
    });

    await prisma.version.create({
      data: {
        version: versions[0].version + 1,
        body: data.body,
        gistId: gist.id,
      },
    });

    return gist;
  });

function RouteComponent() {
  const gist = Route.useLoaderData();
  const [title, setTitle] = useState(gist.title || '');
  const [body, setBody] = useState(gist.versions[0].body || '');
  const [isPublic, setIsPublic] = useState(gist.isPublic || false);
  const router = useRouter();
  const [language, setLanguage] = useState(gist.language || 'typescript');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateGist({
      data: {
        id: gist.id,
        title,
        body,
        language,
        isPublic,
      },
    });

    await router.invalidate();

    router.navigate({
      to: `/gists/${gist.id}`,
    });
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-6 h-full flex flex-col"
      >
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter gist title"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="body">Language</Label>
          <Select onValueChange={(v) => setLanguage(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="TypeScript" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="rust">Rust</SelectItem>
              <SelectItem value="go">Go</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="csharp">C#</SelectItem>
              <SelectItem value="php">PHP</SelectItem>
              <SelectItem value="ruby">Ruby</SelectItem>
              <SelectItem value="swift">Swift</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 flex gap-2 items-center">
          <Label htmlFor="body" className="mt-2">
            Public
          </Label>
          <Switch
            defaultChecked={isPublic}
            onCheckedChange={(v) => setIsPublic(v)}
          />
        </div>
        <div className="space-y-2 h-[calc(100%-300px)]">
          <div className="flex items-center justify-between">
            <Label htmlFor="body">Content</Label>
            <span className="text-sm text-gray-300">
              Version {gist.versions[0].version + 1}
            </span>
          </div>
          <Editor
            language={language}
            value={body}
            onChange={(v) => setBody(v || '')}
          />
        </div>
        <div className="flex relative justify-end pt-8">
          <Button type="submit">Update Gist</Button>
        </div>
      </form>
    </>
  );
}