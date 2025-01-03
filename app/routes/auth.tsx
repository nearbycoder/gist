import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { useAppSession } from '@/libs/session';

export const Route = createFileRoute('/auth')({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await useAppSession();

    if (session.data.userEmail) {
      return redirect({ to: '/' });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
