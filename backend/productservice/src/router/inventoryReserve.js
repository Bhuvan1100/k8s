export const reserveInventory = async (req, res) => {
  const { orderId, items, reservationMinutes } = req.body;

  if (!orderId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: "Invalid reservation request"
    });
  }

  try {
   
    const existingReservation = await prisma.inventoryReservation.findFirst({
      where: {
        orderId,
        status: "RESERVED"
      }
    });

    if (existingReservation) {
      return res.status(200).json({
        success: true,
        message: "Inventory already reserved for this order",
        expiresAt: existingReservation.expiresAt
      });
    }

    const expiresAt = new Date(
      Date.now() + reservationMinutes * 60 * 1000
    );

    await prisma.$transaction(async (tx) => {
      const sortedItems = [...items].sort((a, b) =>
        a.productVariantId.localeCompare(b.productVariantId)
      );

      for (const item of sortedItems) {
        const result = await tx.productVariant.updateMany({
          where: {
            id: item.productVariantId,
            availableQuantity: {
              gte: item.quantity
            }
          },
          data: {
            availableQuantity: {
              decrement: item.quantity
            },
            reservedQuantity: {
              increment: item.quantity
            }
          }
        });

        if (result.count === 0) {
          throw new Error("INSUFFICIENT_INVENTORY");
        }

        await tx.inventoryReservation.create({
          data: {
            orderId,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            expiresAt,
            status: "RESERVED"
          }
        });
      }
    });

    return res.status(200).json({
      success: true,
      expiresAt
    });

  } catch (error) {
    if (error.message === "INSUFFICIENT_INVENTORY") {
      return res.status(409).json({
        message: "One or more items are out of stock"
      });
    }

    return res.status(500).json({
      message: "Inventory reservation failed"
    });
  }
};
