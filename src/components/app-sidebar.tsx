import { Files, GitBranch, LogOut, Users } from 'lucide-react';

import { Link, useRouter } from '@tanstack/react-router';
import { NavUser } from './ui/nav-user';
import { ThemeToggle } from './ThemeToggle';
import type { User } from '@prisma/client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth-client';

// Menu items.
const items = [
  {
    title: 'Gists',
    url: '/',
    icon: GitBranch,
  },
];

// Admin menu items
const adminItems = [
  {
    title: 'User Management',
    url: '/admin/users',
    icon: Users,
  },
  {
    title: 'Gists Management',
    url: '/admin/gists',
    icon: Files,
  },
];

export function AppSidebar({
  user,
}: {
  user: Partial<Pick<User, 'id' | 'email' | 'name' | 'role'>> & {
    impersonatedBy?: string | null;
  };
}) {
  const { setOpenMobile } = useSidebar();
  const router = useRouter();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            Gist <ThemeToggle />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} onClick={() => setOpenMobile(false)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user.role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url} onClick={() => setOpenMobile(false)}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {user.impersonatedBy && (
          <SidebarGroup>
            <SidebarGroupLabel>Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      to="/"
                      onClick={async (e) => {
                        e.preventDefault();
                        setOpenMobile(false);

                        await authClient.admin.stopImpersonating();

                        router.navigate({ to: '/' });
                      }}
                    >
                      <LogOut />
                      <span>Stop Impersonating</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user.name ?? '',
            email: user.email ?? '',
            avatar: '',
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
