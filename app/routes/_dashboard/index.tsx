import { Link, createFileRoute, useRouter } from '@tanstack/react-router';
import { GitFork, Heart, Search, Share, Trash } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { deleteGist, getGists, toggleFavorite } from '@/serverFunctions/gists';
import { GistSearch } from '@/components/gist-search';
import { useDebounce } from '@/hooks/use-debounce';

const searchSchema = z.object({
  search: z.string().optional(),
  language: z.string().optional(),
  isPublic: z.enum(['true', 'false']).optional(),
  favoritesOnly: z.enum(['true', 'false']).optional(),
});

type SearchParams = z.infer<typeof searchSchema>;

export const Route = createFileRoute('/_dashboard/')({
  validateSearch: searchSchema,
  component: Home,
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search } }) => {
    const searchParams = {
      search: search.search,
      language: search.language,
      isPublic: search.isPublic === 'true' ? true : undefined,
      favoritesOnly: search.favoritesOnly === 'true' ? true : undefined,
    };
    return getGists({ data: searchParams });
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Home() {
  const { gists, total } = Route.useLoaderData();
  const router = useRouter();
  const search = Route.useSearch();

  const [searchTerm, setSearchTerm] = useState(search.search || '');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const updateSearch = useCallback(
    (updates: Partial<SearchParams>) => {
      const newSearch = { ...search, ...updates };
      const searchParams: Record<string, string | undefined> = {};

      // Only add non-empty values to searchParams
      if (newSearch.search?.trim()) searchParams.search = newSearch.search;
      if (newSearch.language && newSearch.language !== '-')
        searchParams.language = newSearch.language;
      if (newSearch.isPublic) searchParams.isPublic = newSearch.isPublic;
      if (newSearch.favoritesOnly)
        searchParams.favoritesOnly = newSearch.favoritesOnly;

      router.navigate({
        to: '/',
        search: searchParams,
      });
    },
    [router, search]
  );

  useEffect(() => {
    updateSearch({ search: debouncedSearch });
  }, [debouncedSearch, updateSearch]);

  const handleFavoriteToggle = async (gistId: string) => {
    await toggleFavorite({ data: { gistId } });
    router.invalidate();
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 flex-wrap">
          <div className="flex-1">
            <GistSearch
              search={searchTerm}
              language={search.language || null}
              isPublic={search.isPublic === 'true' ? true : null}
              favoritesOnly={search.favoritesOnly === 'true' ? true : null}
              onSearchChange={setSearchTerm}
              onLanguageChange={(language) =>
                updateSearch({ language: language || undefined })
              }
              onIsPublicChange={(isPublic) =>
                updateSearch({ isPublic: isPublic ? 'true' : undefined })
              }
              onFavoritesOnlyChange={(favoritesOnly) =>
                updateSearch({
                  favoritesOnly: favoritesOnly ? 'true' : undefined,
                })
              }
            />
          </div>
          <Button asChild className="w-full sm:w-auto" size="sm">
            <Link to="/gists/new">+ New Gist</Link>
          </Button>
        </div>
      </div>
      {total > 0 && (
        <div className="flex items-center gap-2 px-4">
          <p className="text-sm text-muted-foreground">
            Showing {gists.length} of {total} result
            {gists.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
      <div className="px-4">
        {gists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-center">No gists found</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              {searchTerm ||
              search.language ||
              search.isPublic ||
              search.favoritesOnly
                ? 'Try adjusting your search filters'
                : 'Create your first gist to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gists.map((gist) => (
              <Link
                key={gist.id}
                to="/gists/$id"
                params={{ id: gist.id }}
                className="group border rounded-lg p-4 hover:border-gray-600 transition-colors"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col truncate">
                      <h2 className="text-lg font-semibold truncate">
                        {gist.title}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-muted-foreground">
                        <span>{gist.language || 'No language'}</span>
                        <span>•</span>
                        <span>
                          {gist.versions.length} version
                          {gist.versions.length !== 1 ? 's' : ''}
                        </span>
                        {gist.forksCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <GitFork className="w-3 h-3" />
                              {gist.forksCount}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        aria-label="Toggle favorite"
                        className="text-muted-foreground hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleFavoriteToggle(gist.id);
                        }}
                      >
                        <Heart
                          className="w-4 h-4"
                          fill={gist.isFavorite ? 'currentColor' : 'none'}
                        />
                      </button>
                      {gist.isPublic && (
                        <button
                          aria-label="Share gist"
                          className="text-muted-foreground hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.navigate({
                              to: `/gists/${gist.id}/share`,
                            });
                          }}
                        >
                          <Share className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (
                            confirm(
                              'Are you sure you want to delete this gist?'
                            )
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
                        className="text-muted-foreground hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
