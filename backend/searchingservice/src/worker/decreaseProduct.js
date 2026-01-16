import { Worker } from "bullmq";
import { redisConnection } from "../infra/redis.js";
import { meiliClient } from "../infra/meilisearch.js";

const INDEX = "products";

new Worker(
  "inventory-queue",
  async job => {
    console.log("inventory job received");
    console.log("job data", job.data);

    const { items } = job.data;

    if (!items || !Array.isArray(items)) {
      throw new Error("INVALID_JOB_DATA");
    }

    for (const item of items) {
      const { productId, size, quantity } = item;

      
      const product = await meiliClient
        .index(INDEX)
        .getDocument(productId);

      if (!product) {
        console.warn("product not found in meilisearch", productId);
        continue; 
      }

     
      if (
        !product.availableSizes ||
        typeof product.availableSizes[size] !== "number"
      ) {
        console.warn(
          "size missing in meilisearch document",
          productId,
          size
        );
        continue;
      }

     
      const updatedQuantity =
        product.availableSizes[size] - quantity;

      product.availableSizes[size] =
        updatedQuantity > 0 ? updatedQuantity : 0;

     
      await meiliClient.index(INDEX).updateDocuments([
        {
          id: productId,
          availableSizes: product.availableSizes
        }
      ]);

      console.log(
        `inventory updated in meilisearch`,
        productId,
        size,
        `-${quantity}`
      );
    }

    return { success: true };
  },
  {
    connection: redisConnection,
    concurrency: 5 
  }
);

console.log("Inventory worker started for queue inventory-queue");
