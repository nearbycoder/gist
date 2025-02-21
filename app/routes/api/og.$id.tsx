import { ImageResponse } from '@vercel/og';
import { createFileRoute } from '@tanstack/react-router';
import { getPublicGist } from '@/serverFunctions/gists';
import { languageDisplayNames } from '@/config/languages';

export const Route = createFileRoute('/api/og/$id')({
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

    const imageData = new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: '#1a1b1e',
            padding: 80,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 40,
            }}
          >
            <img
              src={gist.user.avatarUrl}
              alt={gist.user.name}
              width={80}
              height={80}
              style={{
                borderRadius: '50%',
                marginRight: 20,
              }}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  fontSize: 24,
                  color: '#9ca3af',
                  marginBottom: 8,
                }}
              >
                {gist.user.name}
              </span>
              <span
                style={{
                  fontSize: 18,
                  color: '#6b7280',
                }}
              >
                @{gist.user.username}
              </span>
            </div>
          </div>
          <h1
            style={{
              fontSize: 60,
              fontWeight: 'bold',
              color: '#f3f4f6',
              marginBottom: 20,
              lineHeight: 1.2,
            }}
          >
            {gist.title}
          </h1>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                backgroundColor: '#374151',
                padding: '8px 16px',
                borderRadius: 8,
                color: '#f3f4f6',
                fontSize: 24,
              }}
            >
              {gist.language
                ? languageDisplayNames[gist.language]
                : 'No language'}
            </div>
            <span
              style={{
                color: '#6b7280',
                fontSize: 24,
              }}
            >
              {gist.versions.length} version
              {gist.versions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

    return new Response(imageData.body, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  },
});

function RouteComponent() {
  return null;
}
