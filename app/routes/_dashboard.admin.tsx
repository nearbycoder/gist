import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState } from 'react';
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

const ROLE = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;
type Role = (typeof ROLE)[keyof typeof ROLE];

export const Route = createFileRoute('/_dashboard/admin')({
  component: AdminDashboard,
  beforeLoad: async ({ context }) => {
    if (!context.user || context.user.role !== ROLE.ADMIN) {
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
    console.error(error);
    return <div>You are not authorized to access this page</div>;
  },
});

function AdminDashboard() {
  const { users: initialUsers, currentUserId } = Route.useRouteContext();
  const [users, setUsers] = useState(initialUsers);

  const handleRoleToggle = async (userId: string, newRole: Role) => {
    await updateUserRole({ data: { userId, role: newRole } });
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
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
              <TableHead>Actions</TableHead>
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
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={user.id === currentUserId}
                            onClick={() =>
                              handleRoleToggle(
                                user.id,
                                user.role === Role.ADMIN
                                  ? Role.MEMBER
                                  : Role.ADMIN
                              )
                            }
                          >
                            Toggle Role
                          </Button>
                        </span>
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
