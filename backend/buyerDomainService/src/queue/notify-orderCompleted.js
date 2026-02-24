import { Queue } from "bullmq";
import { redisConnection } from  "../config/redisConnection.js"

export const orderCreatedQueue = new Queue(
  "order-created-buyer",
  {
    connection: redisConnection
  }
);
