import { Worker } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null
});

export const imageWorker = new Worker(
  "image_generation_queue",
  async (job) => {
    await job.updateProgress(100);
    return { ok: true, input: job.data };
  },
  { connection }
);
