import prisma from "../config/prismaClient.js";

export const handlePaymentResult = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { success } = req.query;

    if (!orderId || success === undefined) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment request"
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

    // only pending orders can be paid
    if (order.status !== "PAYMENT_PENDING") {
      return res.status(409).json({
        success: false,
        message: "Order is not awaiting payment"
      });
    }

    // payment timeout check
    if (order.paymentExpiresAt && new Date() > order.paymentExpiresAt) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAYMENT_FAILED"
        }
      });

      // inventory restore should happen here (or via async/cron)

      return res.status(410).json({
        success: false,
        message: "Payment window expired"
      });
    }

    const paymentSuccess = success === "true";

    if (!paymentSuccess) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAYMENT_FAILED"
        }
      });

      // inventory restore should happen here

      return res.status(200).json({
        success: false,
        message: "Payment failed"
      });
    }

    // payment success
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "ORDER_PROCESSING",
        paidAt: new Date(),
        processingUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
      }
    });

    return res.status(200).json({
      success: true,
      message: "Payment successful, order processing started"
    });

  } catch (error) {
    console.error("Payment handling error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};




