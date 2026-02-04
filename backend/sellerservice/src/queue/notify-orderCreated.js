import { Queue } from "bullmq";
import { redisConnection } from "../config/redisClient.js";

export const orderCreatedSellerQueue = new Queue(
  "order-created-seller",
  {
    connection: redisConnection
  }
);
