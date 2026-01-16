import { Queue } from "bullmq";
import { redisConnection } from "../config/redisClient.js";

export const inventoryQueue = new Queue("inventory-queue", {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 500,
    },
  },
});
