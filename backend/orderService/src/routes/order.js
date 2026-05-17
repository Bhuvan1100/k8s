import axios from "axios"
import prisma from "../config/prismaClient.js"
import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"

export const checkAndReserveInventory = async (req, res) => {
  const { userId } = req.body

  appLogger.info("CHECK_AND_RESERVE_INVENTORY_REQUEST", { userId })
  console.log("[CHECK_AND_RESERVE_INVENTORY] request entered", userId)

  try {
    const { items } = req.body

    if (!userId || !Array.isArray(items) || items.length === 0) {
      console.log("[CHECK_AND_RESERVE_INVENTORY] validation failed", userId)
      return res.status(400).json({
        success: false,
        message: "Invalid request data"
      })
    }

    console.log("[CHECK_AND_RESERVE_INVENTORY] calling inventory service")

    const response = await axios.post(
      "http://productservice:4003/seller/products/reserve",
      { items }
    )

    if (!response.data.success) {
      console.log("[CHECK_AND_RESERVE_INVENTORY] inventory unavailable")
      return res.status(409).json({
        success: false,
        message: "Some products are not available"
      })
    }

    console.log("[CHECK_AND_RESERVE_INVENTORY] creating order", userId)

    const order = await prisma.order.create({
      data: {
        userId,
        status: "PAYMENT_PENDING",
        paymentExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
        items: {
          create: items.map(item => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity
          }))
        }
      },
      include: {
        items: true
      }
    })

    appLogger.info("CHECK_AND_RESERVE_INVENTORY_SUCCESS", {
      userId,
      orderId: order.id
    })
    console.log("[CHECK_AND_RESERVE_INVENTORY] success", order.id)

    return res.status(201).json({
      success: true,
      message: "Order created and inventory reserved",
      order
    })

  } catch (error) {
    errorLogger.error("CHECK_AND_RESERVE_INVENTORY_FAILED", {
      userId,
      message: error.message,
      stack: error.stack
    })
    console.log("[CHECK_AND_RESERVE_INVENTORY] failed", userId)

    return res.status(500).json({
      success: false,
      message: "Inventory service unavailable"
    })
  }
}

export const requestReturn = async (req, res) => {
  const { orderId } = req.params

  appLogger.info("REQUEST_RETURN_REQUEST", { orderId })
  console.log("[REQUEST_RETURN] request entered", orderId)

  try {
    if (!orderId) {
      console.log("[REQUEST_RETURN] missing orderId")
      return res.status(400).json({
        success: false,
        message: "orderId is required"
      })
    }

    console.log("[REQUEST_RETURN] fetching order", orderId)

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      console.log("[REQUEST_RETURN] order not found", orderId)
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }

    if (order.status !== "DELIVERED") {
      console.log("[REQUEST_RETURN] invalid order status", orderId)
      return res.status(409).json({
        success: false,
        message: "Return not allowed for this order status"
      })
    }

    if (!order.returnBy || new Date() > order.returnBy) {
      console.log("[REQUEST_RETURN] return window expired", orderId)
      return res.status(410).json({
        success: false,
        message: "Return window expired"
      })
    }

    console.log("[REQUEST_RETURN] updating order", orderId)

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "RETURN_REQUESTED",
        returnRequestedAt: new Date()
      }
    })

    appLogger.info("REQUEST_RETURN_SUCCESS", { orderId })
    console.log("[REQUEST_RETURN] success", orderId)

    return res.status(200).json({
      success: true,
      message: "Return requested successfully"
    })

  } catch (error) {
    errorLogger.error("REQUEST_RETURN_FAILED", {
      orderId,
      message: error.message,
      stack: error.stack
    })
    console.log("[REQUEST_RETURN] failed", orderId)

    return res.status(500).json({
      success: false,
      message: "Failed to request return"
    })
  }
}
