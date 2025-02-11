import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { helloWorldTask } from '@/trigger/example';

export const APIRoute = createAPIFileRoute('/api/worker')({
  GET: ({ request, params }) => {
    helloWorldTask.trigger({ id: 'test' });

    return json({ message: 'Hello "/api/worker"!' });
  },
});
