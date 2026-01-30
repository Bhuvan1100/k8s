import prisma from "../config/prismaClient.js";
import { kafka } from "../kafka/client.js";

const consumer = kafka.consumer({
  groupId: "seller-service-order-consumer"
});

export const startSellerOrderConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "order.success",
    fromBeginning: false
  });

  console.log("[SELLER-SERVICE] Listening to order.success");

  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value.toString());

      const { orderId, items, paidAt } = payload;

      if (!orderId || !items || items.length === 0) {
        return;
      }

      try {
        await prisma.$transaction(async (tx) => {
          for (const item of items) {
            const sellerProduct = await tx.sellerProduct.findUnique({
              where: { id: item.productId },
              select: { sellerId: true }
            });

            if (!sellerProduct) {
              continue;
            }

            const exists = await tx.sellerOrderItem.findFirst({
              where: {
                orderId,
                productVariantId: item.productVariantId
              }
            });

            if (exists) {
              continue;
            }

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
          }
        });

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
