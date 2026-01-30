import { Worker } from "bullmq";
import { redisConnection } from "../infra/redisConnection.js";
import { meiliClient } from "../infra/meilisearch.js";

const INDEX = "products";

new Worker(
  "inventoryQueue",
  async (job) => {
    console.log("inventory sync job received", job.data);

    const { updates } = job.data;

    if (!Array.isArray(updates)) {
      throw new Error("INVALID_JOB_DATA");
    }

    const documents = updates.map(u => ({
      id: u.productId,
      totalQuantity: u.totalQuantity,
      isInStock: u.isInStock
    }));

    await meiliClient.index(INDEX).updateDocuments(documents);

    console.log("inventory synced to meilisearch", documents.length);

    return { success: true };
  },
  {
    connection: redisConnection,
    concurrency: 5
  }
);

console.log("Inventory worker started for queue inventoryQueue");
