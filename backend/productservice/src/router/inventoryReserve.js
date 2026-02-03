import prisma from "../config/prismaClient.js"
import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"

export const reserveInventory = async (req, res) => {
  const { orderId, items, reservationMinutes } = req.body

  appLogger.info("RESERVE_INVENTORY_REQUEST", { orderId })
  console.log("[RESERVE_INVENTORY] request entered", orderId)

  if (!orderId || !Array.isArray(items) || items.length === 0) {
    console.log("[RESERVE_INVENTORY] validation failed", orderId)
    return res.status(400).json({
      message: "Invalid reservation request"
    })
  }

  try {
    console.log("[RESERVE_INVENTORY] checking existing reservation", orderId)

    const existingReservation = await prisma.inventoryReservation.findFirst({
      where: {
        orderId,
        status: "RESERVED"
      }
    })

    if (existingReservation) {
      appLogger.info("RESERVE_INVENTORY_ALREADY_RESERVED", {
        orderId,
        expiresAt: existingReservation.expiresAt
      })
      console.log("[RESERVE_INVENTORY] already reserved", orderId)

      return res.status(200).json({
        success: true,
        message: "Inventory already reserved for this order",
        expiresAt: existingReservation.expiresAt
      })
    }

    const expiresAt = new Date(
      Date.now() + reservationMinutes * 60 * 1000
    )

    console.log("[RESERVE_INVENTORY] starting transaction", orderId)

    await prisma.$transaction(async (tx) => {
      const sortedItems = [...items].sort((a, b) =>
        a.productVariantId.localeCompare(b.productVariantId)
      )

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
        })

        if (result.count === 0) {
          throw new Error("INSUFFICIENT_INVENTORY")
        }

        await tx.inventoryReservation.create({
          data: {
            orderId,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            expiresAt,
            status: "RESERVED"
          }
        })
      }
    })

    appLogger.info("RESERVE_INVENTORY_SUCCESS", {
      orderId,
      expiresAt
    })
    console.log("[RESERVE_INVENTORY] success", orderId)

    return res.status(200).json({
      success: true,
      expiresAt
    })

  } catch (error) {
    if (error.message === "INSUFFICIENT_INVENTORY") {
      console.log("[RESERVE_INVENTORY] insufficient inventory", orderId)
      return res.status(409).json({
        message: "One or more items are out of stock"
      })
    }

    errorLogger.error("RESERVE_INVENTORY_FAILED", {
      orderId,
      message: error.message,
      stack: error.stack
    })
    console.log("[RESERVE_INVENTORY] failed", orderId)

    return res.status(500).json({
      message: "Inventory reservation failed"
    })
  }
}
