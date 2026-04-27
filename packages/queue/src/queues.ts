import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null
});

export const imageGenerationQueue = new Queue("image_generation_queue", { connection });
export const copyGenerationQueue = new Queue("copy_generation_queue", { connection });
export const shopifyPublishQueue = new Queue("shopify_publish_queue", { connection });

export async function enqueueImageGeneration(data: Record<string, unknown>) {
  return imageGenerationQueue.add("generate-images", data);
}

export async function enqueueCopyGeneration(data: Record<string, unknown>) {
  return copyGenerationQueue.add("generate-copy", data);
}

export async function enqueueShopifyPublish(data: Record<string, unknown>) {
  return shopifyPublishQueue.add("publish-shopify-draft", data);
}
