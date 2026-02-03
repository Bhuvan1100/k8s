import prisma from "../config/prismaClient.js"
import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"

export const addComment = async (req, res) => {
  const { productId } = req.params
  const { userId } = req.body

  appLogger.info("ADD_COMMENT_REQUEST", { productId, userId })
  console.log("[ADD_COMMENT] request entered", productId, userId)

  try {
    const { userEmail, comment } = req.body

    if (!productId || !userId || !userEmail || !comment) {
      console.log("[ADD_COMMENT] validation failed", productId, userId)
      return res.status(400).json({
        message: "productId, userId, userEmail and comment are required"
      })
    }

    console.log("[ADD_COMMENT] checking product", productId)

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product || !product.isActive) {
      console.log("[ADD_COMMENT] product not found or inactive", productId)
      return res.status(404).json({
        message: "Product not found"
      })
    }

    console.log("[ADD_COMMENT] creating comment", productId, userId)

    await prisma.productComment.create({
      data: {
        productId,
        userId,
        userEmail,
        comment
      }
    })

    appLogger.info("ADD_COMMENT_SUCCESS", { productId, userId })
    console.log("[ADD_COMMENT] success", productId, userId)

    return res.status(201).json({
      message: "Comment added successfully"
    })

  } catch (error) {
    errorLogger.error("ADD_COMMENT_FAILED", {
      productId,
      userId,
      message: error.message,
      stack: error.stack
    })
    console.log("[ADD_COMMENT] failed", productId, userId)

    return res.status(500).json({
      message: "Internal server error"
    })
  }
}

export const addRating = async (req, res) => {
  const { productId } = req.params
  const { userId } = req.body

  appLogger.info("ADD_RATING_REQUEST", { productId, userId })
  console.log("[ADD_RATING] request entered", productId, userId)

  try {
    const { userEmail, rating } = req.body

    if (!productId || !userId || !userEmail || rating == null) {
      console.log("[ADD_RATING] validation failed", productId, userId)
      return res.status(400).json({
        message: "productId, userId, userEmail and rating are required"
      })
    }

    if (rating < 1 || rating > 5) {
      console.log("[ADD_RATING] invalid rating value", productId, userId)
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      })
    }

    console.log("[ADD_RATING] checking product", productId)

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product || !product.isActive) {
      console.log("[ADD_RATING] product not found or inactive", productId)
      return res.status(404).json({
        message: "Product not found"
      })
    }

    console.log("[ADD_RATING] checking existing rating", productId, userId)

    const existingRating = await prisma.productRating.findFirst({
      where: {
        productId,
        userId
      }
    })

    if (existingRating) {
      console.log("[ADD_RATING] duplicate rating", productId, userId)
      return res.status(409).json({
        message: "User has already rated this product"
      })
    }

    console.log("[ADD_RATING] creating rating", productId, userId)

    await prisma.productRating.create({
      data: {
        productId,
        userId,
        userEmail,
        rating
      }
    })

    console.log("[ADD_RATING] recalculating aggregates", productId)

    const aggregate = await prisma.productRating.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true }
    })

    await prisma.product.update({
      where: { id: productId },
      data: {
        avgRating: aggregate._avg.rating || 0,
        ratingCount: aggregate._count.rating
      }
    })

    appLogger.info("ADD_RATING_SUCCESS", {
      productId,
      userId,
      avgRating: aggregate._avg.rating,
      ratingCount: aggregate._count.rating
    })

    console.log("[ADD_RATING] success", productId, userId)

    return res.status(201).json({
      message: "Product rated successfully",
      avgRating: aggregate._avg.rating,
      ratingCount: aggregate._count.rating
    })

  } catch (error) {
    errorLogger.error("ADD_RATING_FAILED", {
      productId,
      userId,
      message: error.message,
      stack: error.stack
    })
    console.log("[ADD_RATING] failed", productId, userId)

    return res.status(500).json({
      message: "Internal server error"
    })
  }
}
