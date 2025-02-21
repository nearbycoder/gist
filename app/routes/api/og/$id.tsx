import { ImageResponse } from '@vercel/og';
import { createAPIFileRoute } from '@tanstack/start/api';
import { languageDisplayNames } from '@/config/languages';
import { prisma } from '@/lib/db';

export const APIRoute = createAPIFileRoute('/api/og/$id')({
  GET: async ({ params }) => {
    console.log('params', params);
    const gist = await prisma.gist.findUnique({
      where: { id: params.id, isPublic: true },
      include: {
        versions: {
          orderBy: {
            version: 'desc',
          },
        },
        forkedFrom: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    console.log(gist);

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
              src={gist.user.image}
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
