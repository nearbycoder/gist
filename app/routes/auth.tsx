import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { useAppSession } from '@/libs/session';

const getUser = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await useAppSession();

  return session.data.userEmail;
});

export const Route = createFileRoute('/auth')({
  component: RouteComponent,
  beforeLoad: async () => {
    const user = await getUser();

    if (user) {
      redirect({ to: '/', throw: true });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
