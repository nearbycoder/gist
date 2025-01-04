import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { fetchUserFromSession } from '@/serverFunctions/auth';

export const Route = createFileRoute('/auth')({
  component: RouteComponent,
  beforeLoad: async () => {
    const user = await fetchUserFromSession();

    if (user) {
      redirect({ to: '/', throw: true });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
