import { GitBranch } from 'lucide-react';

import { Link } from '@tanstack/react-router';
import { NavUser } from './ui/nav-user';
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
];

export function AppSidebar({
  user,
}: {
  user: Partial<Pick<User, 'id' | 'email' | 'name'>>;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
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
