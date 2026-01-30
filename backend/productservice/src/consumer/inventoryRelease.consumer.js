import prisma from "../config/prismaClient.js";
import { kafka } from "../kafka/client.js";


const consumer = kafka.consumer({
  groupId: "product-service-inventory-failure-consumer"
});

export const startInventoryFailureConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "order.failed",
    fromBeginning: false
  });

  console.log("[PRODUCT-SERVICE] Listening to order.failed");

  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value.toString());
      const { orderId } = payload;

      if (!orderId) {
        return;
      }

      try {
        const updatedProductIds = new Set();

        await prisma.$transaction(async (tx) => {
          const reservations = await tx.inventoryReservation.findMany({
            where: {
              orderId,
              status: "RESERVED"
            }
          });

          for (const reservation of reservations) {
            const variant = await tx.productVariant.update({
              where: { id: reservation.productVariantId },
              data: {
                availableQuantity: {
                  increment: reservation.quantity
                },
                reservedQuantity: {
                  decrement: reservation.quantity
                }
              }
            });

            updatedProductIds.add(variant.productId);

            await tx.inventoryReservation.update({
              where: { id: reservation.id },
              data: {
                status: "RELEASED",
                updatedAt: new Date()
              }
            });
          }
        });

        console.log(
          `[PRODUCT-SERVICE] Inventory released for failed order ${orderId}`
        );

      } catch (error) {
        console.error(
          "[PRODUCT-SERVICE] Inventory release failed",
          error
        );
        throw error;
      }
    }
  });
};
