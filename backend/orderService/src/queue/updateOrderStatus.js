import { Queue } from "bullmq";
import { redisConnection } from "../config/redisClient.js";

export const buyerOrderStatusQueue = new Queue(
  "buyer-order-status-queue",
  {
    connection: redisConnection
  }
);

export const sellerOrderStatusQueue = new Queue(
  "seller-order-status-queue",
  {
    connection: redisConnection
  }
);
