import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/gists/')({
  beforeLoad: () => {
    throw redirect({
      to: '/',
    });
  },
});
