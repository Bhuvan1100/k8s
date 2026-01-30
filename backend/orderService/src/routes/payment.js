import prisma from "../config/prismaClient.js";
import { kafkaProducer } from "../producer/producer.js";

export const handlePayment = async (req, res) => {
  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res.status(400).json({
      message: "orderId and status are required"
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

    // 🔒 Idempotency guard
    if (order.status === "PAID" || order.status === "PAYMENT_FAILED") {
      return res.status(200).json({
        message: "Payment already processed"
      });
    }

   
    if (status === "SUCCESS") {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          paidAt: new Date()
        }
      });

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
      };

      await kafkaProducer.send({
        topic: "order.success",
        messages: [
          {
            key: updatedOrder.id,
            value: JSON.stringify(eventPayload)
          }
        ]
      });

      return res.status(200).json({
        message: "Payment successful",
        orderId: updatedOrder.id
      });
    }

   
    if (status === "FAILED") {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAYMENT_FAILED"
        }
      });

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
      });

      return res.status(200).json({
        message: "Payment failed",
        orderId
      });
    }

    return res.status(400).json({
      message: "Invalid payment status"
    });

  } catch (error) {
    console.error("[ORDER-SERVICE] payment error:", error);

    return res.status(500).json({
      message: "Payment processing failed"
    });
  }
};
