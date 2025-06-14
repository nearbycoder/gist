'use client';

import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { getGists } from '@/serverFunctions/gists';
import { languageDisplayNames } from '@/config/languages';

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [gists, setGists] = React.useState<Array<any>>([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  React.useEffect(() => {
    if (!open) return;

    const fetchGists = async () => {
      const results = await getGists({
        data: {
          search: debouncedSearch,
          language: undefined,
          isPublic: undefined,
          favoritesOnly: undefined,
          take: debouncedSearch ? undefined : 20,
        },
      });
      setGists(results);
    };

    fetchGists();
  }, [open, debouncedSearch]);

  const handleSelect = (gistId: string) => {
    setOpen(false);
    navigate({ to: `/gists/${gistId}` });
  };

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    if (!o) {
      setSearch('');
      setGists([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setSearch('');
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <CommandInput
        placeholder="Search gists..."
        value={search}
        onValueChange={setSearch}
        onKeyDown={handleKeyDown}
      />
      <CommandList>
        <CommandEmpty>No gists found.</CommandEmpty>
        <CommandGroup heading={search ? 'Search Results' : 'Recent Gists'}>
          {gists.map((gist) => (
            <CommandItem
              key={gist.id}
              value={gist.title}
              onSelect={() => handleSelect(gist.id)}
            >
              <Search className="mr-2 h-4 w-4" />
              <span>{gist.title}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {gist.language
                  ? languageDisplayNames[gist.language]
                  : 'No language'}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
