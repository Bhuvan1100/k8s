import { Queue } from "bullmq";
import { redisConnection } from "../config/redisClient.js";

export const addItemToSellerQueue = new Queue(
  "addItemToSeller",
  { connection: redisConnection }
);
