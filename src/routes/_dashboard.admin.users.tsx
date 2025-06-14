import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { fetchUsers, updateUserRole } from '@/serverFunctions/admin';
import { authClient } from '@/lib/auth-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ROLE = {
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;
type Role = (typeof ROLE)[keyof typeof ROLE];

export const Route = createFileRoute('/_dashboard/admin/users')({
  component: AdminDashboard,
  beforeLoad: async ({ context }) => {
    if (context.user.role !== ROLE.ADMIN) {
      throw redirect({
        to: '/',
      });
    }

    return {
      users: await fetchUsers(),
      currentUserId: context.user.id,
    };
  },
  errorComponent: (error) => {
    return <div>You are not authorized to access this page</div>;
  },
});

function AdminDashboard() {
  const { users: initialUsers, currentUserId } = Route.useRouteContext();
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);

  const handleRoleToggle = async (userId: string, newRole: Role) => {
    await updateUserRole({ data: { userId, role: newRole } });
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
  };

  const impersonateUser = async (userId: string) => {
    await authClient.admin.impersonateUser({
      userId,
    });
  };

  return (
    <div className="p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === ROLE.ADMIN ? 'default' : 'secondary'}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right justify-end flex">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="flex items-center gap-2"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              disabled={user.id === currentUserId}
                              onClick={() =>
                                handleRoleToggle(
                                  user.id,
                                  user.role === ROLE.ADMIN
                                    ? ROLE.MEMBER
                                    : ROLE.ADMIN
                                )
                              }
                            >
                              Toggle Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={user.id === currentUserId}
                              onClick={async () => {
                                await impersonateUser(user.id);
                                router.navigate({ to: '/' });
                              }}
                            >
                              Impersonate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TooltipTrigger>
                      {user.id === currentUserId && (
                        <TooltipContent>
                          <p>You cannot modify your own role</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
