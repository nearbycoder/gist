import { createFileRoute, Link } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import { prisma } from '@/lib/db';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gist, User, Version } from '@prisma/client';

type GistWithUserAndVersions = Gist & {
  user: User;
  versions: Version[];
};

export const Route = createFileRoute('/gists/public')({
  component: PublicGistsPage,
  loader: async () => {
    const publicGists = await prisma.gist.findMany({
      where: {
        isPublic: true,
      },
      include: {
        user: true,
        versions: {
          orderBy: {
            version: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return {
      publicGists,
    };
  },
});

function PublicGistsPage() {
  const { publicGists } = Route.useLoaderData() as { publicGists: GistWithUserAndVersions[] };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Public Gists</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publicGists.map((gist) => (
          <Card key={gist.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar>
                <AvatarImage src={gist.user.image || undefined} />
                <AvatarFallback>{gist.user.name?.[0] || gist.user.email[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>
                  <Link
                    to="/gists/$id/share"
                    params={{ id: gist.id }}
                    className="hover:underline"
                  >
                    {gist.title}
                  </Link>
                </CardTitle>
                <CardDescription>
                  by {gist.user.name || gist.user.email} •{' '}
                  {formatDistanceToNow(new Date(gist.updatedAt), { addSuffix: true })}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {gist.language && (
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {gist.language}
                  </span>
                )}
                <span className="ml-2">{gist.forksCount} forks</span>
              </div>
              {gist.versions[0] && (
                <p className="mt-4 text-sm line-clamp-3">{gist.versions[0].body}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}