import { Worker } from "bullmq";
import prisma from "../config/prismaClient.js";
import { redisConnection } from "../config/redisClient.js";

export const buyerOrderStatusWorker = new Worker(
  "buyer-order-status-queue",
  async (job) => {
    const { orderId, status } = job.data;

    if (!orderId || !status) return;

    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
  },
  {
    connection: redisConnection
  }
);

buyerOrderStatusWorker.on("ready", () => {
  console.log("[BUYER_ORDER_STATUS_WORKER] ready");
});

buyerOrderStatusWorker.on("completed", (job) => {
  console.log(
    "[BUYER_ORDER_STATUS_WORKER] order status updated",
    {
      orderId: job.data.orderId,
      status: job.data.status
    }
  );
});

buyerOrderStatusWorker.on("failed", (job, err) => {
  console.error(
    "[BUYER_ORDER_STATUS_WORKER] failed",
    job?.data,
    err.message
  );
});
