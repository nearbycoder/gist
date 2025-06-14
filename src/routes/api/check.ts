import { createServerFileRoute } from '@tanstack/react-start/server';
import { json } from '@tanstack/react-start';

export const ServerRoute = createServerFileRoute('/api/check').methods({
  GET: () => {
    return json({ message: 'Healthy' }, { status: 200 });
  },
});
