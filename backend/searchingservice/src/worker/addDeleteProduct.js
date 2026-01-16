import { Worker } from "bullmq";
import { redisConnection } from "../infra/redisConnection.js";
import { meiliClient } from "../infra/meilisearch.js";

const INDEX = "products";

new Worker(
  "product-search-sync",
  async job => {
    console.log("job received");
    console.log("job name:", job.name);
    console.log("job data:", job.data);

    try {
      const { action } = job.data;

      if (action === "DELETE") {
        const { productId } = job.data;

        console.log("deleting product from meilisearch", productId);

        await meiliClient.index(INDEX).deleteDocument(productId);

        console.log("product deleted from meilisearch", productId);

        return { deleted: true, productId };
      }

      if (action === "ADD") {
        const {
          id,
          title,
          description,
          category,
          isActive,
          availableSizes,
          createdAt,
        } = job.data;

        console.log("indexing product", id);

        await meiliClient.index(INDEX).addDocuments([
          {
            id,
            title,
            description,
            category,
            isActive,
            availableSizes,
            createdAt,
          },
        ]);

        console.log("product indexed in meilisearch", id);

        return { indexed: true, productId: id };
      }

      throw new Error(`UNKNOWN_ACTION: ${action}`);
    } catch (err) {
      console.error("meilisearch worker error", err);
      throw err;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

console.log("Meilisearch worker started for queue product-search-sync");
