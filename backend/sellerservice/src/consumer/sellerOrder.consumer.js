import prisma from "../config/prismaClient.js";
import { kafka } from "../kafka/client.js";
import { orderCreatedSellerQueue } from "../queue/notify-orderCreated.js";

const consumer = kafka.consumer({
  groupId: "seller-service-order-consumer"
});

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

export const startSellerOrderConsumer = async () => {
  let connected = false;

  while (!connected) {
    try {
      console.log("[SELLER-SERVICE] Connecting to Kafka...");
      await consumer.connect();

      await consumer.subscribe({
        topic: "order.success",
        fromBeginning: false
      });

      connected = true;
      console.log("[SELLER-SERVICE] Listening to order.success");
    } catch (error) {
      console.error(
        "[SELLER-SERVICE] Kafka not ready, retrying in 3s..."
      );
      await wait(3000);
    }
  }

  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value.toString());

      const { orderId, items, paidAt } = payload;

      if (!orderId || !Array.isArray(items) || items.length === 0) {
        return;
      }

      const queueJobs = [];

      try {
        await prisma.$transaction(async (tx) => {
          // deterministic ordering (good practice for locks)
          const sortedItems = [...items].sort((a, b) =>
            a.productVariantId.localeCompare(b.productVariantId)
          );

          for (const item of sortedItems) {
            const sellerProduct = await tx.sellerProduct.findUnique({
              where: { id: item.productId },
              select: { sellerId: true }
            });

            if (!sellerProduct) continue;

            const exists = await tx.sellerOrderItem.findFirst({
              where: {
                orderId,
                productVariantId: item.productVariantId
              }
            });

            if (exists) continue;

            await tx.sellerOrderItem.create({
              data: {
                sellerId: sellerProduct.sellerId,
                orderId,
                productId: item.productId,
                productVariantId: item.productVariantId,
                quantity: item.quantity,
                priceSnapshot: item.priceSnapshot,
                status: "PAID",
                soldAt: paidAt ? new Date(paidAt) : new Date()
              }
            });

            await tx.seller.update({
              where: { id: sellerProduct.sellerId },
              data: {
                totalOrders: { increment: 1 },
                totalRevenue: {
                  increment: item.priceSnapshot * item.quantity
                }
              }
            });

            const seller = await tx.seller.findUnique({
              where: { id: sellerProduct.sellerId },
              select: { email: true }
            });

            if (seller?.email) {
              queueJobs.push({
                orderId,
                productId: item.productId,
                productVariantId: item.productVariantId,
                email: seller.email
              });
            }
          }
        });

       
        if (queueJobs.length > 0) {
          for (const job of queueJobs) {
            await orderCreatedSellerQueue.add(
              "notify-order-created-seller",
              job,
              {
                jobId: `${job.orderId}-${job.productVariantId}`,
                removeOnComplete: true,
                attempts: 3
              }
            );
          }
        }

        console.log(
          `[SELLER-SERVICE] Order processed for sellers: ${orderId}`
        );
      } catch (error) {
        console.error(
          "[SELLER-SERVICE] Failed to process order.success",
          error
        );
        throw error;
      }
    }
  });
};