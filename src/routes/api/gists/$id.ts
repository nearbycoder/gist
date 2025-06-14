import { createServerFileRoute } from '@tanstack/react-start/server';
import { json } from '@tanstack/react-start';
import { prisma } from '@/lib/db';

export const ServerRoute = createServerFileRoute('/api/gists/$id').methods({
  GET: async ({ params, request }) => {
    const { id } = params;
    const url = new URL(request.url);
    const version =
      url.searchParams.get('version') || url.searchParams.get('v');

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
