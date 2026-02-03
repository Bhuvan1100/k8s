import { Queue } from "bullmq";
import { redisConnection } from "../config/redisClient.js"

export const roleUpdaterQueue = new Queue("role-updater-queue", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 3000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});
