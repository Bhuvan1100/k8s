import prisma from "../config/prismaClient.js";
import { kafka } from "../kafka/client.js";

const consumer = kafka.consumer({
  groupId: "product-service-inventory-failure-consumer"
});

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

export const startInventoryFailureConsumer = async () => {
  let connected = false;

  while (!connected) {
    try {
      console.log("[PRODUCT-SERVICE] Connecting to Kafka...");
      await consumer.connect();

      await consumer.subscribe({
        topic: "order.failed",
        fromBeginning: false
      });

      connected = true;
      console.log("[PRODUCT-SERVICE] Listening to order.failed");
    } catch (error) {
      console.error("[PRODUCT-SERVICE] Kafka not ready, retrying in 3s...");
      await wait(3000);
    }
  }

  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value.toString());
      const { orderId } = payload;

      if (!orderId) {
        return;
      }

      try {
        await prisma.$transaction(async (tx) => {
          const reservations = await tx.inventoryReservation.findMany({
            where: {
              orderId,
              status: "RESERVED"
            }
          });

          for (const reservation of reservations) {
            await tx.productVariant.update({
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