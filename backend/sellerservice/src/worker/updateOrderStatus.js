import { Worker } from "bullmq";
import prisma from "../config/prismaClient.js";
import { redisConnection } from "../config/redisClient.js";

export const sellerOrderStatusWorker = new Worker(
  "seller-order-status-queue",
  async (job) => {
    const { orderId, status } = job.data;

    if (!orderId || !status) return;

    await prisma.sellerOrderItem.updateMany({
      where: { orderId },
      data: { status }
    });
  },
  {
    connection: redisConnection
  }
);

sellerOrderStatusWorker.on("ready", () => {
  console.log("[SELLER_ORDER_STATUS_WORKER] ready");
});

sellerOrderStatusWorker.on("failed", (job, err) => {
  console.error(
    "[SELLER_ORDER_STATUS_WORKER] failed",
    job?.data,
    err.message
  );
});
