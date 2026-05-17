import axios from "axios"
import prisma from "../config/prismaClient.js"
import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"

export const commitCheckoutSession = async (req, res) => {
  const { sessionId, userId } = req.body
  const requestId = req.headers["x-request-id"]

  appLogger.info("COMMIT_CHECKOUT_SESSION_REQUEST", { sessionId, userId, requestId })
  console.log("[COMMIT_CHECKOUT_SESSION] request entered", sessionId, userId)

  try {
    console.log("[COMMIT_CHECKOUT_SESSION] fetching session", sessionId)

    const session = await prisma.checkoutSession.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      console.log("[COMMIT_CHECKOUT_SESSION] session not found", sessionId)
      return res.status(404).json({ message: "Session not found" })
    }

    if (session.userId !== userId) {
      console.log("[COMMIT_CHECKOUT_SESSION] session-user mismatch", sessionId, userId)
      return res.status(403).json({ message: "Session does not belong to user" })
    }

    if (session.status !== "DETAILS_FILLED") {
      console.log("[COMMIT_CHECKOUT_SESSION] invalid session state", sessionId, session.status)
      return res.status(400).json({
        message: "Session not ready for payment"
      })
    }

    console.log("[COMMIT_CHECKOUT_SESSION] creating order", sessionId)

    const order = await prisma.order.create({
      data: {
        userId,
        status: "PAYMENT_PENDING",
        userDetailSnapshot: session.buyerDetailsSnapshot,
        billingSnapshot: session.pricingSnapshot,
        paymentExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
        items: {
          create: session.itemsSnapshot.map(item => ({
            productId: item.productId,
            productVariantId: item.productVariantId,
            size: item.size,
            quantity: item.quantity,
            priceSnapshot: item.price
          }))
        }
      }
    })

    console.log("[COMMIT_CHECKOUT_SESSION] order created", order.id)

    const reservePayload = {
      orderId: order.id,
      items: session.itemsSnapshot.map(item => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity
      })),
      reservationMinutes: 15
    }

    console.log("[COMMIT_CHECKOUT_SESSION] reserving inventory", order.id)

    const reserveResponse = await axios.post(
      "http://productservice:4003/product/reserve",
      reservePayload,
      {
        headers: { "x-request-id": requestId }
      }
    )

    console.log("[COMMIT_CHECKOUT_SESSION] updating checkout session", sessionId)

    await prisma.checkoutSession.update({
      where: { id: sessionId },
      data: {
        status: "PAYMENT_PENDING",
        orderId: order.id,
        expiresAt: new Date(reserveResponse.data.expiresAt)
      }
    })

    appLogger.info("COMMIT_CHECKOUT_SESSION_SUCCESS", {
      sessionId,
      orderId: order.id
    })
    console.log("[COMMIT_CHECKOUT_SESSION] success", order.id)

    return res.status(200).json({
      orderId: order.id,
      expiresAt: reserveResponse.data.expiresAt
    })

  } catch (error) {
    errorLogger.error("COMMIT_CHECKOUT_SESSION_FAILED", {
      sessionId,
      userId,
      requestId,
      message: error.message,
      stack: error.stack
    })
    console.log("[COMMIT_CHECKOUT_SESSION] failed", sessionId)

    return res.status(500).json({
      message: "Failed to commit checkout session"
    })
  }
}
