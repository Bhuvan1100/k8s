import prisma from "../config/prismaClient.js";
import { kafka } from "../kafka/client.js";
import { inventoryQueue } from "../infra/inventoryQueue.js";

const consumer = kafka.consumer({
  groupId: "product-service-inventory-consumer"
});

export const startInventoryConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "order.success",
    fromBeginning: false
  });

  console.log("[PRODUCT-SERVICE] Listening to order.success");

  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value.toString());
      const { orderId, items } = payload;

      if (!orderId || !Array.isArray(items) || items.length === 0) {
        return;
      }

      try {
        const updatedProductIds = new Set();

        await prisma.$transaction(async (tx) => {
          const sortedItems = [...items].sort((a, b) =>
            a.productVariantId.localeCompare(b.productVariantId)
          );

          for (const item of sortedItems) {
            const reservation = await tx.inventoryReservation.findUnique({
              where: {
                orderId_productVariantId: {
                  orderId,
                  productVariantId: item.productVariantId
                }
              }
            });

            if (!reservation || reservation.status !== "RESERVED") {
              continue;
            }

            const variant = await tx.productVariant.update({
              where: { id: item.productVariantId },
              data: {
                reservedQuantity: { decrement: reservation.quantity }
              }
            });

            updatedProductIds.add(variant.productId);

            await tx.inventoryReservation.update({
              where: { id: reservation.id },
              data: {
                status: "CONSUMED",
                updatedAt: new Date()
              }
            });
          }
        });

        const updates = [];

        for (const productId of updatedProductIds) {
          const aggregate = await prisma.productVariant.aggregate({
            where: { productId },
            _sum: {
              availableQuantity: true
            }
          });

          const totalQuantity = aggregate._sum.availableQuantity || 0;

          await prisma.product.update({
            where: { id: productId },
            data: { totalQuantity }
          });

          updates.push({
            productId,
            totalQuantity,
            isInStock: totalQuantity > 0
          });
        }
        console.log(
          "[PRODUCT-SERVICE] inventory updates count",
          updates.length
        )

        if (updates.length > 0) {
          await inventoryQueue.add(
            "inventory-sync",
            { updates },
            {
              removeOnComplete: true,
              attempts: 3
            }
          );
        }

        console.log(
          `[PRODUCT-SERVICE] Inventory consumed & synced for order ${orderId}`
        );

      } catch (error) {
        console.error(
          "[PRODUCT-SERVICE] Inventory consume failed",
          error
        );
        throw error;
      }
    }
  });
};
