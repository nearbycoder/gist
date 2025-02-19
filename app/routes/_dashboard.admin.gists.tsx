import { Link, createFileRoute, redirect } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { fetchAllGists, fetchUsersList } from '@/serverFunctions/admin';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { languageDisplayNames } from '@/config/languages';

const ROLE = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export const Route = createFileRoute('/_dashboard/admin/gists')({
  component: AdminGists,
  beforeLoad: async ({ context }) => {
    const user = context.user;
    if (!('role' in user) || user.role !== ROLE.ADMIN) {
      throw redirect({
        to: '/',
      });
    }

    const [gistsData, users] = await Promise.all([
      fetchAllGists({ data: { page: 1, perPage: 10 } }),
      fetchUsersList(),
    ]);

    return {
      gistsData,
      users,
    };
  },
  errorComponent: () => {
    return <div>You are not authorized to access this page</div>;
  },
});

function AdminGists() {
  const { gistsData, users } = Route.useRouteContext();

  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);
  const [currentData, setCurrentData] = useState<typeof gistsData>(gistsData);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAllGists({
        data: {
          search: debouncedSearch,
          userId: selectedUser === 'all' ? undefined : selectedUser,
          page,
          perPage: 10,
        },
      });
      setCurrentData(data);
    };

    fetchData();
  }, [debouncedSearch, selectedUser, page]);

  return (
    <div className="p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">Gist Management</h1>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search gists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Filter by user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.gists.map((gist) => (
              <TableRow key={gist.id}>
                <TableCell>{gist.title}</TableCell>
                <TableCell>
                  {gist.language
                    ? languageDisplayNames[gist.language]
                    : 'Plain Text'}
                </TableCell>
                <TableCell>
                  <Badge variant={gist.isPublic ? 'default' : 'secondary'}>
                    {gist.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {gist.user.name
                    ? `${gist.user.name} (${gist.user.email})`
                    : gist.user.email}
                </TableCell>
                <TableCell>
                  {new Date(gist.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(gist.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {gist.isPublic && (
                    <Link
                      to="/gists/$id/share"
                      params={{ id: gist.id }}
                      className="text-blue-500 hover:text-blue-700 underline"
                    >
                      View Public
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {currentData.pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <PaginationPrevious />
                </Button>
              </PaginationItem>
              {Array.from(
                { length: currentData.pagination.totalPages },
                (_, i) => i + 1
              ).map((i) => (
                <PaginationItem key={i}>
                  <Button
                    size="sm"
                    variant={page === i ? 'default' : 'outline'}
                    onClick={() => setPage(i)}
                  >
                    {i}
                  </Button>
                </PaginationItem>
              ))}
              <PaginationItem>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setPage((p) =>
                      Math.min(currentData.pagination.totalPages, p + 1)
                    )
                  }
                  disabled={page === currentData.pagination.totalPages}
                >
                  <PaginationNext />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
