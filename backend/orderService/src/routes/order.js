import axios from "axios";
import prisma from "../config/prismaClient.js";

export const checkAndReserveInventory = async (req, res) => {
  try {
    const { userId, items } = req.body;

    if (!userId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data"
      });
    }

    
    const response = await axios.post(
      "http://localhost:4003/products/reserve",
      { items }
    );

    if (!response.data.success) {
      return res.status(409).json({
        success: false,
        message: "Some products are not available"
      });
    }

    
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
    });

    return res.status(201).json({
      success: true,
      message: "Order created and inventory reserved",
      order
    });

  } catch (error) {
    console.error("Inventory check failed", error.message);

    return res.status(500).json({
      success: false,
      message: "Inventory service unavailable"
    });
  }
};





export const requestReturn = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required"
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    
    if (order.status !== "DELIVERED") {
      return res.status(409).json({
        success: false,
        message: "Return not allowed for this order status"
      });
    }

    // Check return window
    if (!order.returnBy || new Date() > order.returnBy) {
      return res.status(410).json({
        success: false,
        message: "Return window expired"
      });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "RETURN_REQUESTED",
        returnRequestedAt: new Date()
      }
    });

    return res.status(200).json({
      success: true,
      message: "Return requested successfully"
    });

  } catch (error) {
    console.error("Return request error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to request return"
    });
  }
};
