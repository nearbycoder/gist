import { defineWorker } from 'plainjob';
import { queue } from './queue';

// Define a worker
const worker = defineWorker(
  'print',
  (job) => {
    console.log(`Processing job ${job.id}: ${job.data}`);
  },
  { queue }
);

// Start the worker
worker.start();
