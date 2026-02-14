import { Queue } from "bullmq";
import { redisConnection } from "../config/redisClient.js";

export const updateRatingQueue = new Queue(
  "updateRating",
  { connection: redisConnection }
);
