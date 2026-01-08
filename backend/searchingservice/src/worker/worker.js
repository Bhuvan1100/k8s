import { Worker } from "bullmq";
import { redisConnection } from "../infra/redis.js";

new Worker(
  "product-search-sync",
  async job => {
    // index into Elasticsearch
    console.log(job.name, job.data);
  },
  { connection: redisConnection }
);
