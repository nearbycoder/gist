import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { Editor } from '@/components/Editor.client';
import { getPublicGist } from '@/serverFunctions/gists';
import { languageDisplayNames } from '@/config/languages';

const themeSchema = z.object({
  theme: z.enum(['dark', 'light', 'auto']).catch('auto'),
  version: z.number().catch(1),
});
export const Route = createFileRoute('/gists/$id/embed')({
  component: RouteComponent,
  validateSearch: (search) => {
    return themeSchema.parse(search);
  },
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
        {
          'http-equiv': 'Content-Security-Policy',
          content: 'frame-ancestors *;',
        },
      ],
    };
  },
  errorComponent: ({ error }) => {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-3 text-center">
        <p className="text-sm text-gray-200">
          {error.message === 'Gist not found'
            ? "This gist doesn't exist or isn't public"
            : error.message}
        </p>
      </div>
    );
  },
});

function RouteComponent() {
  const gist = Route.useLoaderData();
  const { theme, version } = Route.useSearch();

  if (!gist.versions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-3 text-center">
        <p className="text-sm text-gray-200">This gist has no content</p>
      </div>
    );
  }

  const selectedVersion =
    gist.versions.find((v) => v.version === version) || gist.versions[0];

  return (
    <div className="w-full h-screen">
      <Editor
        value={selectedVersion.body}
        language={gist.language || 'plaintext'}
        minimal
        theme={theme}
      />
    </div>
  );
}
