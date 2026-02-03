import axios from "axios"
import prisma from "../config/prismaClient.js"
import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"

export const checkoutPreview = async (req, res) => {
  const requestId = req.headers["x-request-id"]
  const { userId } = req.body

  appLogger.info("CHECKOUT_PREVIEW_REQUEST", { userId, requestId })
  console.log("[CHECKOUT_PREVIEW] request entered", userId, requestId)

  try {
    console.log("[CHECKOUT_PREVIEW] calling buyer cart service", requestId)

    const cartResponse = await axios.post(
      "http://buyerservice:4002/buyer/cart/cartcheckout",
      req.body,
      {
        headers: {
          "x-request-id": requestId
        }
      }
    )

    const cartItems = cartResponse.data?.items

    if (!cartItems || cartItems.length === 0) {
      console.log("[CHECKOUT_PREVIEW] cart empty", userId)
      return res.status(400).json({
        message: "Cart is empty",
        canProceed: false
      })
    }

    console.log("[CHECKOUT_PREVIEW] calling product soft check", requestId)

    const softCheckPayload = {
      ...req.body,
      items: cartItems.map(item => ({
        productId: item.productId,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        size: item.size
      }))
    }

    const productResponse = await axios.post(
      "http://productservice:4006/product/softcheck",
      softCheckPayload,
      {
        headers: {
          "x-request-id": requestId
        }
      }
    )

    const previewItems = productResponse.data?.items || []
    const subtotal = productResponse.data?.subtotal || 0

    console.log("[CHECKOUT_PREVIEW] creating checkout session", userId)

    const deliveryCharge = subtotal < 500 ? 80 : 0
    const discount = 0
    const total = subtotal + deliveryCharge

    const session = await prisma.checkoutSession.create({
      data: {
        userId: req.body.userId,
        cartId: cartResponse.data?.cartId,
        status: "PREVIEW",
        itemsSnapshot: previewItems,
        pricingSnapshot: {
          subtotal,
          deliveryCharge,
          discount,
          total
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    })

    appLogger.info("CHECKOUT_PREVIEW_SUCCESS", {
      userId,
      sessionId: session.id
    })
    console.log("[CHECKOUT_PREVIEW] success", session.id)

    return res.status(200).json({
      ...productResponse.data,
      sessionId: session.id
    })

  } catch (error) {
    if (error.response) {
      console.log("[CHECKOUT_PREVIEW] downstream error", requestId)
      return res.status(error.response.status).json(error.response.data)
    }

    errorLogger.error("CHECKOUT_PREVIEW_FAILED", {
      userId,
      requestId,
      message: error.message,
      stack: error.stack
    })
    console.log("[CHECKOUT_PREVIEW] failed", userId)

    return res.status(500).json({
      message: "Checkout preview failed"
    })
  }
}
