import cron from "node-cron";
import prisma from "../config/prismaClient.js";
import {
  buyerOrderStatusQueue,
  sellerOrderStatusQueue
} from "../queue/updateOrderStatus.js";

export const startOrderLifecycleCron = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("Order lifecycle cron running");

    try {
      const now = new Date();

      // PAID → ORDER_PROCESSING
      const paidOrders = await prisma.order.findMany({
        where: { status: "PAID" },
        select: { id: true }
      });

      const paidToProcessing = await prisma.order.updateMany({
        where: { status: "PAID" },
        data: {
          status: "ORDER_PROCESSING",
          processingUntil: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
        }
      });

      if (paidToProcessing.count > 0) {
        for (const order of paidOrders) {
          await buyerOrderStatusQueue.add("ORDER_STATUS_UPDATED", {
            orderId: order.id,
            status: "ORDER_PROCESSING"
          });

          await sellerOrderStatusQueue.add("ORDER_STATUS_UPDATED", {
            orderId: order.id,
            status: "ORDER_PROCESSING"
          });
        }
      }

      // ORDER_PROCESSING → SHIPPING
      const processingOrders = await prisma.order.findMany({
        where: {
          status: "ORDER_PROCESSING",
          processingUntil: { lt: now }
        },
        select: { id: true }
      });

      const processingToShipping = await prisma.order.updateMany({
        where: {
          status: "ORDER_PROCESSING",
          processingUntil: { lt: now }
        },
        data: {
          status: "SHIPPING",
          shippingUntil: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
        }
      });

      if (processingToShipping.count > 0) {
        for (const order of processingOrders) {
          await buyerOrderStatusQueue.add("ORDER_STATUS_UPDATED", {
            orderId: order.id,
            status: "SHIPPING"
          });

          await sellerOrderStatusQueue.add("ORDER_STATUS_UPDATED", {
            orderId: order.id,
            status: "SHIPPING"
          });
        }
      }

      // SHIPPING → DELIVERED
      const shippingOrders = await prisma.order.findMany({
        where: {
          status: "SHIPPING",
          shippingUntil: { lt: now }
        },
        select: { id: true }
      });

      const shippingToDelivered = await prisma.order.updateMany({
        where: {
          status: "SHIPPING",
          shippingUntil: { lt: now }
        },
        data: {
          status: "DELIVERED",
          deliveredAt: now,
          returnBy: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)
        }
      });

      if (shippingToDelivered.count > 0) {
        for (const order of shippingOrders) {
          await buyerOrderStatusQueue.add("ORDER_STATUS_UPDATED", {
            orderId: order.id,
            status: "DELIVERED"
          });

          await sellerOrderStatusQueue.add("ORDER_STATUS_UPDATED", {
            orderId: order.id,
            status: "DELIVERED"
          });
        }
      }

      // DELIVERED → COMPLETED (return window expired)
      const deliveredOrders = await prisma.order.findMany({
        where: {
          status: "DELIVERED",
          returnBy: { lt: now }
        },
        select: { id: true }
      });

      const deliveredToCompleted = await prisma.order.updateMany({
        where: {
          status: "DELIVERED",
          returnBy: { lt: now }
        },
        data: {
          status: "COMPLETED"
        }
      });

      if (deliveredToCompleted.count > 0) {
        for (const order of deliveredOrders) {
          await buyerOrderStatusQueue.add("ORDER_STATUS_UPDATED", {
            orderId: order.id,
            status: "COMPLETED"
          });

          await sellerOrderStatusQueue.add("ORDER_STATUS_UPDATED", {
            orderId: order.id,
            status: "COMPLETED"
          });
        }
      }


      // RETURN_REQUESTED → RETURN_PROCESSING
      const returnRequestedOrders = await prisma.order.findMany({
        where: {
          status: "RETURN_REQUESTED",
          returnRequestedAt: {
            lt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
          }
        },
        select: { id: true }
      });

      const returnRequestedToProcessing = await prisma.order.updateMany({
        where: {
          status: "RETURN_REQUESTED",
          returnRequestedAt: {
            lt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
          }
        },
        data: {
          status: "RETURN_PROCESSING",
          returnProcessingUntil: new Date(
            now.getTime() + 3 * 24 * 60 * 60 * 1000
          )
        }
      });

      if (returnRequestedToProcessing.count > 0) {
        for (const order of returnRequestedOrders) {
          await buyerOrderStatusQueue.add("ORDER_STATUS_UPDATED", {
            orderId: order.id,
            status: "RETURN_PROCESSING"
          });

          await sellerOrderStatusQueue.add("ORDER_STATUS_UPDATED", {
            orderId: order.id,
            status: "RETURN_PROCESSING"
          });
        }
      }

      // RETURN_PROCESSING → REFUND_INITIATED
      const returnProcessingOrders = await prisma.order.findMany({
        where: {
          status: "RETURN_PROCESSING",
          returnProcessingUntil: { lt: now }
        },
        select: { id: true }
      });

      const returnProcessingToRefund = await prisma.order.updateMany({
        where: {
          status: "RETURN_PROCESSING",
          returnProcessingUntil: { lt: now }
        },
        data: {
          status: "REFUND_INITIATED",
          refundInitiatedAt: now
        }
      });

      if (returnProcessingToRefund.count > 0) {
        for (const order of returnProcessingOrders) {
          await buyerOrderStatusQueue.add("ORDER_STATUS_UPDATED", {
            orderId: order.id,
            status: "REFUND_INITIATED"
          });

          await sellerOrderStatusQueue.add("ORDER_STATUS_UPDATED", {
            orderId: order.id,
            status: "REFUND_INITIATED"
          });
        }
      }

      // REFUND_INITIATED → RETURNED_SUCCESS
      const refundOrders = await prisma.order.findMany({
        where: {
          status: "REFUND_INITIATED",
          refundInitiatedAt: {
            lt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
          }
        },
        select: { id: true }
      });

      const refundToReturnedSuccess = await prisma.order.updateMany({
        where: {
          status: "REFUND_INITIATED",
          refundInitiatedAt: {
            lt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
          }
        },
        data: {
          status: "RETURNED_SUCCESS"
        }
      });

      if (refundToReturnedSuccess.count > 0) {
        for (const order of refundOrders) {
          await buyerOrderStatusQueue.add("ORDER_STATUS_UPDATED", {
            orderId: order.id,
            status: "RETURNED_SUCCESS"
          });

          await sellerOrderStatusQueue.add("ORDER_STATUS_UPDATED", {
            orderId: order.id,
            status: "RETURNED_SUCCESS"
          });
        }
      }

    } catch (error) {
      console.error("Order lifecycle cron error", error);
    }
  });
};
