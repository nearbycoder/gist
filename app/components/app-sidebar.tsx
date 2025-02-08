import { GitBranch, Settings, Users } from 'lucide-react';

import { Link } from '@tanstack/react-router';
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

// Menu items.
const items = [
  {
    title: 'Gists',
    url: '/',
    icon: GitBranch,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];

// Admin menu items
const adminItems = [
  {
    title: 'User Management',
    url: '/admin',
    icon: Users,
  },
];

export function AppSidebar({
  user,
}: {
  user: Partial<Pick<User, 'id' | 'email' | 'name' | 'role'>>;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            Application <ThemeToggle />
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

        {user.role === 'ADMIN' && (
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
