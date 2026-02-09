import cron from "node-cron";
import prisma from "../config/prismaClient.js";

export const startOrderLifecycleCron = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("Order lifecycle cron running");

    try {
      const now = new Date();

      const paidToProcessing = await prisma.order.updateMany({
        where: {
          status: "PAID"
        },
        data: {
          status: "ORDER_PROCESSING",
          processingUntil: new Date(
            now.getTime() + 1 * 24 * 60 * 60 * 1000
          )
        }
      });

      if (paidToProcessing.count > 0) {
        console.log(
          `Moved ${paidToProcessing.count} orders from PAID to ORDER_PROCESSING`
        );
      }

      const processingToShipping = await prisma.order.updateMany({
        where: {
          status: "ORDER_PROCESSING",
          processingUntil: {
            lt: now
          }
        },
        data: {
          status: "SHIPPING",
          shippingUntil: new Date(
            now.getTime() + 3 * 24 * 60 * 60 * 1000
          )
        }
      });

      if (processingToShipping.count > 0) {
        console.log(
          `Moved ${processingToShipping.count} orders to SHIPPING`
        );
      }

      const shippingToDelivered = await prisma.order.updateMany({
        where: {
          status: "SHIPPING",
          shippingUntil: {
            lt: now
          }
        },
        data: {
          status: "DELIVERED",
          deliveredAt: now,
          returnBy: new Date(
            now.getTime() + 5 * 24 * 60 * 60 * 1000
          )
        }
      });

      if (shippingToDelivered.count > 0) {
        console.log(
          `Moved ${shippingToDelivered.count} orders to DELIVERED`
        );
      }

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
        console.log(
          `Moved ${returnRequestedToProcessing.count} orders to RETURN_PROCESSING`
        );
      }

      const returnProcessingToRefund = await prisma.order.updateMany({
        where: {
          status: "RETURN_PROCESSING",
          returnProcessingUntil: {
            lt: now
          }
        },
        data: {
          status: "REFUND_INITIATED",
          refundInitiatedAt: now
        }
      });

      if (returnProcessingToRefund.count > 0) {
        console.log(
          `Moved ${returnProcessingToRefund.count} orders to REFUND_INITIATED`
        );
      }

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
        console.log(
          `Moved ${refundToReturnedSuccess.count} orders to RETURNED_SUCCESS`
        );
      }

    } catch (error) {
      console.error("Order lifecycle cron error", error);
    }
  });
};
