import { Queue } from "bullmq";
import { redisConnection } from "../config/redisClient.js";

export const productSearchQueue = new Queue(
  "productSearchQueue",
  { connection: redisConnection },
  
);
