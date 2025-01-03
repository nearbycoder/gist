import { Link, createFileRoute, useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { z } from 'zod';
import { Share, Trash } from 'lucide-react';
import { prisma } from '@/libs/db';
import { useAppSession } from '@/libs/session';
import { Button } from '@/components/ui/button';

export const getGists = createServerFn({
  method: 'GET',
}).handler(async () => {
  const session = await useAppSession();
  const user = await prisma.user.findUnique({
    where: { email: session.data.userEmail },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return await prisma.gist.findMany({
    where: {
      userId: user.id,
    },
    include: {
      versions: true,
    },
  });
});

export const deleteGist = createServerFn({
  method: 'POST',
})
  .validator(
    z.object({
      gistId: z.string(),
    })
  )
  .handler(async ({ data }) => {
    const session = await useAppSession();
    const user = await prisma.user.findUnique({
      where: { email: session.data.userEmail },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await prisma.version.deleteMany({
      where: {
        gistId: data.gistId,
      },
    });

    await prisma.gist.delete({
      where: { id: data.gistId, userId: user.id },
    });

    return;
  });

export const Route = createFileRoute('/_dashboard/')({
  component: Home,
  loader: async () => getGists(),
});

function Home() {
  const gists = Route.useLoaderData();
  const router = useRouter();

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-end w-full">
        <Button asChild>
          <Link to="/gists/new">+ New Gist</Link>
        </Button>
      </div>
      <div className="p-6 space-y-6">
        {gists.length === 0 ? (
          <div className="text-center text-gray-500 p-12 border-2 border-dashed rounded-lg">
            <p className="text-lg font-medium">No gists found</p>
            <p className="text-sm">Create your first gist to get started</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gists.map((gist) => (
              <Link
                to={`/gists/$id`}
                params={{
                  id: gist.id,
                }}
                key={gist.id}
              >
                <li className="border rounded-lg p-6  transition-colors group relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-lg truncate pr-8">
                      {gist.title || 'Untitled Gist'}
                    </div>

                    <button
                      aria-label="Share gist"
                      className={`top-4 right-12 text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity ${
                        gist.isPublic ? 'absolute' : 'hidden'
                      }`}
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        await router.navigate({
                          to: `/gists/${gist.id}/share`,
                        });
                      }}
                    >
                      <Share />
                    </button>
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (
                          confirm('Are you sure you want to delete this gist?')
                        ) {
                          await deleteGist({
                            data: {
                              gistId: gist.id,
                            },
                          });

                          router.invalidate();
                        }
                      }}
                      aria-label="Delete gist"
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-800">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {gist.language || 'No language'}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-300">
                      {gist.versions.length} version
                      {gist.versions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </li>
              </Link>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
