import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { JobStatus } from 'plainjob';
import queue from '../../../queue';

export const APIRoute = createAPIFileRoute('/api/test')({
  GET: async ({ request, params }) => {
    queue.add('example', { message: 'Hello, world!' });
    const count = await queue.countJobs({ status: JobStatus.Pending });

    return json({ message: 'blah', count });
  },
});
