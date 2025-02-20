import { defineWorker } from 'plainjob';
import queue from './queue';

const worker = defineWorker(
  'example',
  async (job) => {
    console.log(`Processing job ${job.id}: ${job.data}`);
  },
  { queue }
);

worker.start();
