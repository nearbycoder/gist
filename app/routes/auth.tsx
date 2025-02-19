import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { fetchUserFromSession } from '@/serverFunctions/auth';

export const Route = createFileRoute('/auth')({
  component: RouteComponent,
  beforeLoad: async () => {
    const { email } = await fetchUserFromSession();

    if (email) {
      redirect({ to: '/', throw: true });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
