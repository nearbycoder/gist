import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';

export const APIRoute = createAPIFileRoute('/api/check')({
  GET: () => {
    return json({ message: 'Healthy' }, { status: 200 });
  },
});
