import { json } from '@tanstack/react-start';
import { JobStatus } from 'plainjob';
import { createServerFileRoute } from '@tanstack/react-start/server';
import queue from '../../../queue';

export const ServerRoute = createServerFileRoute('/api/test').methods({
  GET: async () => {
    queue.add('example', { message: 'Hello, world!' });
    const count = await queue.countJobs({ status: JobStatus.Pending });

    return json({ message: 'blah', count });
  },
});
