import axios from "axios";
import prisma from "../config/prismaClient.js";

export const commitCheckoutSession = async (req, res) => {
  const { sessionId, userId } = req.body;
  const requestId = req.headers["x-request-id"];

  console.log("[ORDER-SERVICE] commitCheckoutSession called");
  console.log("[ORDER-SERVICE] sessionId:", sessionId);
  console.log("[ORDER-SERVICE] userId:", userId);

  try {
    const session = await prisma.checkoutSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.userId !== userId) {
      return res.status(403).json({ message: "Session does not belong to user" });
    }

    if (session.status !== "DETAILS_FILLED") {
      return res.status(400).json({
        message: "Session not ready for payment"
      });
    }

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
    });

    console.log("[ORDER-SERVICE] Order created:", order.id);

    const reservePayload = {
      orderId: order.id,
      items: session.itemsSnapshot.map(item => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity
      })),
      reservationMinutes: 15
    };

    const reserveResponse = await axios.post(
      "http://productservice:4006/product/reserve",
      reservePayload,
      {
        headers: { "x-request-id": requestId }
      }
    );

    await prisma.checkoutSession.update({
      where: { id: sessionId },
      data: {
        status: "PAYMENT_PENDING",
        orderId: order.id,
        expiresAt: new Date(reserveResponse.data.expiresAt)
      }
    });

    return res.status(200).json({
      orderId: order.id,
      expiresAt: reserveResponse.data.expiresAt
    });

  } catch (error) {
    console.error("[ORDER-SERVICE] commit failed:", error);

    return res.status(500).json({
      message: "Failed to commit checkout session"
    });
  }
};
