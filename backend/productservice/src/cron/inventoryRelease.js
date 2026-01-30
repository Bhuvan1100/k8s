import cron from "node-cron";
import prisma from "../config/prismaClient.js";

cron.schedule("*/1 * * * *", async () => {
  console.log("[CRON] Inventory reservation expiry job started");

  try {
    const expiredReservations = await prisma.inventoryReservation.findMany({
      where: {
        status: "RESERVED",
        expiresAt: {
          lt: new Date()
        }
      }
    });

    if (expiredReservations.length === 0) {
      console.log("[CRON] No expired reservations found");
      return;
    }

    for (const reservation of expiredReservations) {
      await prisma.$transaction(async (tx) => {
        await tx.productVariant.update({
          where: { id: reservation.productVariantId },
          data: {
            reservedQuantity: {
              decrement: reservation.quantity
            },
            availableQuantity: {
              increment: reservation.quantity
            }
          }
        });

        await tx.inventoryReservation.update({
          where: { id: reservation.id },
          data: {
            status: "RELEASED"
          }
        });
      });

      console.log(
        "[CRON] Released reservation",
        reservation.id,
        "for order",
        reservation.orderId
      );
    }

    console.log("[CRON] Inventory reservation expiry job completed");

  } catch (error) {
    console.error("[CRON] Inventory reservation expiry job failed", error);
  }
});
