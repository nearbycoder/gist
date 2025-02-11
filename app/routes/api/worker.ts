import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { JobStatus } from 'plainjob';
import { queue } from '@/jobs/queue';

export const APIRoute = createAPIFileRoute('/api/worker')({
  GET: ({ request, params }) => {
    queue.add('print', { example: '123' });

    const pendingCount = queue.countJobs({ status: JobStatus.Pending });

    const scheduledJobs = queue.getScheduledJobs();
    const types = queue.getJobTypes();

    return json({ jobs: scheduledJobs, types, pendingCount });
  },
});
