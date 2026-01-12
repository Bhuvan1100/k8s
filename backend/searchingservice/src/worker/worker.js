import { Worker } from "bullmq";
import { redisConnection } from "../infra/redis.js";
import { meiliClient } from "../infra/meilisearch.js";

const INDEX = "products";

new Worker(
  "product-search-sync",
  async job => {
    console.log("job received");
    console.log("job name", job.name);
    console.log("job data", job.data);

    try {
      // DELETE case
      if (job.data.action === "DELETE") {
        console.log("deleting product from meilisearch", job.data.productId);

        await meiliClient.index(INDEX).deleteDocument(job.data.productId);

        console.log("product deleted from meilisearch", job.data.productId);

        return { deleted: true, productId: job.data.productId };
      }

      
      console.log("indexing product", job.data.id);

      await meiliClient.index(INDEX).addDocuments([
        {
          id: job.data.id,
          title: job.data.title,
          description: job.data.description,
          category: job.data.category,
          isActive: job.data.isActive,
          availableSizes: job.data.availableSizes,
          createdAt: job.data.createdAt
        }
      ]);

      console.log("product indexed in meilisearch", job.data.id);

      return { indexed: true, productId: job.data.id };

    } catch (err) {
      console.error("meilisearch worker error", err.message);
      throw err;
    }
  },
  { connection: redisConnection }
);

console.log("Meilisearch worker started for queue product-search-sync");
