import { Worker } from "bullmq";
import { redisConnection } from "../infra/redisConnection.js";
import { meiliClient } from "../infra/meilisearch.js";

const INDEX = "products";

new Worker(
  "productSearchQueue",
  async (job) => {
    console.log("job received");
    console.log("job name:", job.name);
    console.log("job data:", job.data);

    try {
      const { action, document } = job.data;

      if (action === "DELETE") {
        console.log("deleting product from meilisearch", document.id);

        await meiliClient.index(INDEX).deleteDocument(document.id);

        console.log("product deleted from meilisearch", document.id);

        return { deleted: true, productId: document.id };
      }

      if (action === "ADD") {
        console.log("indexing product", document.id);

        await meiliClient.index(INDEX).addDocuments([document]);

        console.log("product indexed in meilisearch", document.id);

        return { indexed: true, productId: document.id };
      }

      throw new Error(`UNKNOWN_ACTION: ${action}`);
    } catch (err) {
      console.error("meilisearch worker error", err);
      throw err;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5
  }
);

console.log("Meilisearch worker started for queue productSearchQueue");

