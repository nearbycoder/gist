import { inngest } from './client';

export default inngest.createFunction(
  { id: 'hello-world' },
  { event: 'demo/event.sent' },
  async ({ event, step }) => {
    await step.sleep('test', '10s');

    return {
      message: `Hello ${event.name}!`,
    };
  }
);
