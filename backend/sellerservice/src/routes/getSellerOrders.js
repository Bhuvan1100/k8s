import prisma from "../config/prismaClient.js";
import appLogger from "../logger/appLogger.js";
import errorLogger from "../logger/errorLogger.js";

export const getSellerOrders = async (req, res) => {
  const { userId } = req.body;

  console.log("[GET_SELLER_ORDERS] request received", { userId });

  if (!userId) {
    return res.status(400).json({
      message: "userId is required"
    });
  }

  try {
   
    const seller = await prisma.seller.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!seller) {
      return res.status(404).json({
        message: "Seller not found"
      });
    }

    
    const items = await prisma.sellerOrderItem.findMany({
      where: {
        sellerId: seller.id
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    appLogger.info("GET_SELLER_ORDERS_SUCCESS", {
      userId,
      count: items.length
    });

    
    return res.status(200).json({
      items: items.map(item => ({
        orderId: item.orderId,
        productId: item.productId,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        priceSnapshot: item.priceSnapshot,
        status: item.status
      }))
    });

  } catch (error) {
    errorLogger.error("GET_SELLER_ORDERS_FAILED", {
      userId,
      message: error.message,
      stack: error.stack
    });

    console.log("[GET_SELLER_ORDERS] error", userId);

    return res.status(500).json({
      message: "Failed to fetch seller orders"
    });
  }
};
