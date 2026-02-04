import { Queue } from "bullmq";
import {redisConnection} from "../config/redisClient.js";

export const orderCreatedQueue = new Queue(
  "order-created-buyer",
  {
    connection: redisConnection
  }
);
