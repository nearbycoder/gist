import { Navigate, Outlet, createFileRoute } from '@tanstack/react-router';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { fetchUser } from '@/serverFunctions/auth';
import { CommandPalette } from '@/components/command-palette';

export const Route = createFileRoute('/_dashboard')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw new Error('Not authenticated');
    }

    return {
      user: await fetchUser(),
    };
  },
  errorComponent: ({ error }) => {
    if (error.message === 'Not authenticated') {
      return <Navigate to="/auth/login" />;
    }

    throw error;
  },
});

function RouteComponent() {
  const { user } = Route.useRouteContext();

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <main className="w-full h-screen overflow-hidden">
        <div className="flex items-center justify-between p-2">
          <SidebarTrigger />
        </div>
        <Separator />
        <div className="p-2 h-[calc(100vh-44px)]">
          <Outlet />
        </div>
      </main>
      <CommandPalette />
    </SidebarProvider>
  );
}
