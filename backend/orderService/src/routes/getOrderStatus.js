import prisma from "../config/prismaClient.js";
import appLogger from "../logger/appLogger.js";
import errorLogger from "../logger/errorLogger.js";

export const getOrderStatus = async (req, res) => {
  const { orderId } = req.body;

  console.log("[GET_ORDER_STATUS] request received", { orderId });

  if (!orderId) {
    return res.status(400).json({
      message: "orderId is required"
    });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true
      }
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    appLogger.info("GET_ORDER_STATUS_SUCCESS", {
      orderId,
      status: order.status
    });

    console.log("[GET_ORDER_STATUS] order fetched", orderId);

    return res.status(200).json({
      orderId: order.id,
      userId: order.userId,
      status: order.status,

      paymentExpiresAt: order.paymentExpiresAt,

      userDetailSnapshot: order.userDetailSnapshot,
      billingSnapshot: order.billingSnapshot,

      paidAt: order.paidAt,
      processingUntil: order.processingUntil,
      shippingUntil: order.shippingUntil,
      deliveredAt: order.deliveredAt,

      returnRequestedAt: order.returnRequestedAt,
      returnBy: order.returnBy,
      returnProcessingUntil: order.returnProcessingUntil,
      refundInitiatedAt: order.refundInitiatedAt,

      createdAt: order.createdAt,
      updatedAt: order.updatedAt,

      items: order.items
    });

  } catch (error) {
    errorLogger.error("GET_ORDER_STATUS_FAILED", {
      orderId,
      message: error.message,
      stack: error.stack
    });

    console.log("[GET_ORDER_STATUS] error", orderId);

    return res.status(500).json({
      message: "Failed to fetch order details"
    });
  }
};
