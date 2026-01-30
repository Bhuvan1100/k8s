import prisma from "../config/prismaClient.js";
import { kafka } from "../kafka/client.js";

const consumer = kafka.consumer({
  groupId: "buyer-service-order-consumer"
});

export const startBuyerOrderConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "order.success",
    fromBeginning: false
  });

  console.log("[BUYER-SERVICE] Listening to order.success");

  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value.toString());

      const {
        orderId,
        userId,
        billingSnapshot,
        items,
        paidAt
      } = payload;

      if (!orderId || !userId || !items || items.length === 0) {
        console.warn("[BUYER-SERVICE] Invalid order.success payload");
        return;
      }

      try {
        await prisma.$transaction(async (tx) => {
          const existingOrder = await tx.order.findUnique({
            where: { id: orderId }
          });

          if (existingOrder) {
            return;
          }

          const totalAmount = items.reduce(
            (sum, item) =>
              sum + Number(item.priceSnapshot) * item.quantity,
            0
          );

          await tx.order.create({
            data: {
              id: orderId,
              userId,
              status: "PAID",
              totalAmount,
              billingSnapshot,
              createdAt: paidAt ? new Date(paidAt) : new Date(),
              items: {
                create: items.map(item => ({
                  productId: item.productId,
                  productVariantId: item.productVariantId,
                  size: item.size,
                  quantity: item.quantity,
                  priceSnapshot: item.priceSnapshot,
                  titleSnapshot: null
                }))
              }
            }
          });
        });

        console.log(
          `[BUYER-SERVICE] Order stored for buyer: ${orderId}`
        );

      } catch (error) {
        console.error(
          "[BUYER-SERVICE] Failed to process order.success",
          error
        );
        throw error; // important: let Kafka retry
      }
    }
  });
};
