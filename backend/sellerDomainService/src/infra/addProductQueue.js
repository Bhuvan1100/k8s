import { Queue } from "bullmq";
import { redisConnection } from "./redis.js";

export const productSearchQueue = new Queue(
  "product-search-sync",
  { connection: redisConnection }
);
