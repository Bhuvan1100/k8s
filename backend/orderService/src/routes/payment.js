import prisma from "../config/prismaClient.js"
import { kafkaProducer } from "../producer/producer.js"
import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"

export const handlePayment = async (req, res) => {
  const { orderId, status } = req.body

  appLogger.info("HANDLE_PAYMENT_REQUEST", { orderId, status })
  console.log("[HANDLE_PAYMENT] request entered", orderId, status)

  if (!orderId || !status) {
    console.log("[HANDLE_PAYMENT] validation failed", orderId)
    return res.status(400).json({
      message: "orderId and status are required"
    })
  }

  try {
    console.log("[HANDLE_PAYMENT] fetching order", orderId)

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true
      }
    })

    if (!order) {
      console.log("[HANDLE_PAYMENT] order not found", orderId)
      return res.status(404).json({
        message: "Order not found"
      })
    }

    if (order.status === "PAID" || order.status === "PAYMENT_FAILED") {
      console.log("[HANDLE_PAYMENT] idempotent hit", orderId, order.status)
      return res.status(200).json({
        message: "Payment already processed"
      })
    }

    if (status === "SUCCESS") {
      console.log("[HANDLE_PAYMENT] processing success", orderId)

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          paidAt: new Date()
        }
      })

      const eventPayload = {
        orderId: updatedOrder.id,
        userId: updatedOrder.userId,
        billingSnapshot: updatedOrder.billingSnapshot,
        items: order.items.map(item => ({
          productId: item.productId,
          productVariantId: item.productVariantId,
          size: item.size,
          quantity: item.quantity,
          priceSnapshot: item.priceSnapshot
        })),
        paidAt: updatedOrder.paidAt
      }

      console.log("[HANDLE_PAYMENT] emitting success event", updatedOrder.id)

      await kafkaProducer.send({
        topic: "order.success",
        messages: [
          {
            key: updatedOrder.id,
            value: JSON.stringify(eventPayload)
          }
        ]
      })

      appLogger.info("HANDLE_PAYMENT_SUCCESS", { orderId: updatedOrder.id })
      console.log("[HANDLE_PAYMENT] success", updatedOrder.id)

      return res.status(200).json({
        message: "Payment successful",
        orderId: updatedOrder.id
      })
    }

    if (status === "FAILED") {
      console.log("[HANDLE_PAYMENT] processing failure", orderId)

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAYMENT_FAILED"
        }
      })

      console.log("[HANDLE_PAYMENT] emitting failure event", orderId)

      await kafkaProducer.send({
        topic: "order.failed",
        messages: [
          {
            key: orderId,
            value: JSON.stringify({
              orderId,
              userId: order.userId,
              failedAt: new Date()
            })
          }
        ]
      })

      appLogger.info("HANDLE_PAYMENT_FAILED", { orderId })
      console.log("[HANDLE_PAYMENT] failed", orderId)

      return res.status(200).json({
        message: "Payment failed",
        orderId
      })
    }

    console.log("[HANDLE_PAYMENT] invalid status", orderId, status)

    return res.status(400).json({
      message: "Invalid payment status"
    })

  } catch (error) {
    errorLogger.error("HANDLE_PAYMENT_ERROR", {
      orderId,
      status,
      message: error.message,
      stack: error.stack
    })
    console.log("[HANDLE_PAYMENT] error", orderId)

    return res.status(500).json({
      message: "Payment processing failed"
    })
  }
}
