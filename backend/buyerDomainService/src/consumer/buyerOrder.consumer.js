import prisma from "../config/prismaClient.js"
import { kafka } from "../kafka/client.js"
import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"
import { orderCreatedQueue } from "../queue/notify-orderCompleted.js"

const consumer = kafka.consumer({
  groupId: "buyer-service-order-consumer"
})

export const startBuyerOrderConsumer = async () => {
  await consumer.connect()
  await consumer.subscribe({
    topic: "order.success",
    fromBeginning: false
  })

  appLogger.info("BUYER_ORDER_CONSUMER_STARTED", {
    topic: "order.success"
  })
  console.log("[BUYER_ORDER_CONSUMER] listening to order.success")

  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value.toString())

      const { orderId, userId, items } = payload

      appLogger.info("BUYER_ORDER_EVENT_RECEIVED", { orderId, userId })
      console.log("[BUYER_ORDER_CONSUMER] message received", orderId, userId)

      if (!orderId || !userId || !items || items.length === 0) {
        console.log("[BUYER_ORDER_CONSUMER] invalid payload", orderId)
        return
      }

      let useremail = null
      let orderCreated = false

      try {
        await prisma.$transaction(async (tx) => {
          const existingOrder = await tx.order.findUnique({
            where: { id: orderId }
          })

          if (existingOrder) {
            console.log("[BUYER_ORDER_CONSUMER] order already exists", orderId)
            return
          }

          const user = await tx.user.findUnique({
            where: { userId }
          })

          if (!user) {
            throw new Error("USER_NOT_FOUND_FOR_ORDER")
          }

          useremail = user.email

          const totalAmount = items.reduce(
            (sum, item) =>
              sum + Number(item.priceSnapshot) * item.quantity,
            0
          )

          console.log("[BUYER_ORDER_CONSUMER] creating buyer order", orderId)

          await tx.order.create({
            data: {
              id: orderId,
              userId: user.id,
              status: "PAID",
              totalAmount,
              billingSnapshot: payload.billingSnapshot,
              addressSnapshot : payload.userDetailSnapshot,
              createdAt: payload.paidAt
                ? new Date(payload.paidAt)
                : new Date(),
              items: {
                create: items.map(item => ({
                  productId: item.productId,
                  productVariantId: item.productVariantId,
                  size: item.size,
                  quantity: item.quantity,
                  priceSnapshot: item.priceSnapshot,
                  titleSnapshot: null
                }))
              }
            }
          })

          orderCreated = true
        })

        if (orderCreated && useremail) {
          await orderCreatedQueue.add(
            "notify-order-completed",
            {
              orderId,
              email: useremail
            },
            {
              jobId: orderId
            }
          )
        }

        appLogger.info("BUYER_ORDER_STORED", { orderId })
        console.log("[BUYER_ORDER_CONSUMER] order stored", orderId)

      } catch (error) {
        errorLogger.error("BUYER_ORDER_CONSUMER_FAILED", {
          orderId,
          message: error.message,
          stack: error.stack
        })
        console.log("[BUYER_ORDER_CONSUMER] failed", orderId)
        throw error
      }
    }
  })
}
