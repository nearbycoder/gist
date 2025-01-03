import { Navigate, Outlet, createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { prisma } from '@/libs/db';
import { useAppSession } from '@/libs/session';

const fetchUser = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await useAppSession();

  try {
    return await prisma.user.findFirstOrThrow({
      where: { email: session.data.userEmail },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    // eslint-disable-next-line unused-imports/no-unused-vars
  } catch (_error) {
    await session.clear();
    throw new Error('Not authenticated');
  }
});

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
      <main className="w-full h-screen">
        <div className="flex items-center justify-between p-2">
          <SidebarTrigger />
        </div>
        <Separator />
        <div className="p-2 h-[calc(100vh-44px)]">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
