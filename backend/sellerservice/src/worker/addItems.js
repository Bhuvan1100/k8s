import { Worker } from "bullmq"
import prisma from "../config/prismaClient.js"
import { redisConnection } from "../config/redisClient.js"

export const sellerProductWorker = new Worker(
  "addItemToSeller",
  async (job) => {
    const { action, sellerUserId, productId, variants, isActive } = job.data

    if (!sellerUserId || !productId) {
      throw new Error("Invalid job payload")
    }

    const seller = await prisma.seller.findUnique({
      where: { userId: sellerUserId }
    })

    if (!seller) {
      throw new Error("Seller not found")
    }

    const sellerId = seller.id

    if (action === "ADD") {
      await prisma.$transaction(async (tx) => {
        const existingProduct = await tx.sellerProduct.findUnique({
          where: { id: productId }
        })

        if (!existingProduct) {
          await tx.sellerProduct.create({
            data: {
              id: productId,
              sellerId,
              title: "",
              defaultImage: null,
              isActive: isActive ?? true,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
        }

        if (Array.isArray(variants)) {
          for (const variant of variants) {
            await tx.sellerProductVariant.upsert({
              where: {
                productVariantId: variant.productVariantId
              },
              update: {
                isActive: true,
                updatedAt: new Date()
              },
              create: {
                productId,
                productVariantId: variant.productVariantId,
                size: variant.size,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            })
          }
        }
      })

      return
    }

    if (action === "DELETE") {
      await prisma.$transaction(async (tx) => {
        await tx.sellerProduct.updateMany({
          where: { id: productId },
          data: {
            isActive: false,
            updatedAt: new Date()
          }
        })

        await tx.sellerProductVariant.updateMany({
          where: { productId },
          data: {
            isActive: false,
            updatedAt: new Date()
          }
        })
      })

      return
    }
  },
  {
    connection: redisConnection,
    concurrency: 5
  }
)

sellerProductWorker.on("ready", () => {
  console.log("[ADD_DELETE_ITEM_WORKER] ready");
});

sellerProductWorker.on("completed", (job) => {
  console.log(`[SELLER-WORKER] Job completed: ${job.id}`)
})

sellerProductWorker.on("failed", (job, err) => {
  console.error(
    `[SELLER-WORKER] Job failed: ${job?.id}`,
    err.message
  )
})
