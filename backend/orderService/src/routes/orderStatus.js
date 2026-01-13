import prisma from "../config/prismaClient.js";

export const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required"
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    return res.status(200).json({
      success: true,
      status: order.status
    });

  } catch (error) {
    console.error("Get order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order status"
    });
  }
};
