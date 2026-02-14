import { Worker } from "bullmq";
import { redisConnection } from "../infra/redisConnection.js";
import { meiliClient } from "../infra/meilisearch.js";

const INDEX = "products";

new Worker(
  "updateRating",
  async (job) => {
    console.log("rating update job received");
    console.log("job name:", job.name);
    console.log("job data:", job.data);

    try {
      const { productId, averageRating, totalRatings } = job.data;

      if (!productId) {
        throw new Error("Missing productId in updateRating job");
      }

      console.log("updating avgRating in meilisearch", productId);

      await meiliClient.index(INDEX).updateDocuments([
        {
          id: productId,
          avgRating: averageRating,
          ratingCount: totalRatings
        }
      ]);

      console.log("avgRating updated in meilisearch", productId);

      return {
        updated: true,
        productId
      };

    } catch (err) {
      console.error("updateRating worker error", err);
      throw err;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5
  }
);

console.log("Meilisearch worker started for queue updateRating");
