import prisma from "../config/prismaClient.js";
import appLogger from "../logger/appLogger.js";
import errorLogger from "../logger/errorLogger.js";

export const getBuyerOrders = async (req, res) => {
  const { userId } = req.body;

  console.log("[GET_BUYER_ORDERS] request received", { userId });

  if (!userId) {
    return res.status(400).json({
      message: "userId is required"
    });
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        user: {
          userId
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        items: true
      }
    });

    appLogger.info("GET_BUYER_ORDERS_SUCCESS", {
      userId,
      count: orders.length
    });

    return res.status(200).json({
      orders: orders.map(order => ({
        orderId: order.id,
        status: order.status,

        billingSnapshot: order.billingSnapshot,
        addressSnapshot: order.addressSnapshot,

        purchasedAt: order.createdAt,
        updatedAt: order.updatedAt,

        items: order.items.map(item => ({
          productId: item.productId,
          productVariantId: item.productVariantId,
          size: item.size,
          quantity: item.quantity
        }))
      }))
    });

  } catch (error) {
    errorLogger.error("GET_BUYER_ORDERS_FAILED", {
      userId,
      message: error.message,
      stack: error.stack
    });

    console.log("[GET_BUYER_ORDERS] error", userId);

    return res.status(500).json({
      message: "Failed to fetch buyer orders"
    });
  }
};
