import { createAPIFileRoute } from '@tanstack/start/api';
import { json } from '@tanstack/start';
import { prisma } from '@/libs/db';

export const APIRoute = createAPIFileRoute('/api/gists/$id')({
  GET: async ({ params, request }) => {
    const { id } = params;
    const url = new URL(request.url);
    const version = url.searchParams.get('version');

    const gist = await prisma.gist.findUnique({
      where: { id, isPublic: true },
      include: {
        versions: {
          orderBy: {
            version: 'desc',
          },
        },
      },
    });

    if (!gist) {
      return json(
        { error: 'Gist not found or is not public' },
        { status: 404 }
      );
    }

    if (version) {
      const ver = gist.versions.find((v) => v.version === Number(version));
      if (!ver) {
        return json({ error: 'Version not found' }, { status: 404 });
      }
      return new Response(ver.body);
    }

    return new Response(gist.versions[0].body);
  },
});
