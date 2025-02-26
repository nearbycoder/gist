import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';

export const APIRoute = createAPIFileRoute('/api/check')({
  GET: () => {
    return json({ message: 'Healthy' }, { status: 200 });
  },
});
