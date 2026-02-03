import prisma from "../config/prismaClient.js"
import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"

export const getProductDetail = async (req, res) => {
  const { productId } = req.params

  appLogger.info("GET_PRODUCT_DETAIL_REQUEST", { productId })
  console.log("[GET_PRODUCT_DETAIL] request entered", productId)

  try {
    if (!productId) {
      console.log("[GET_PRODUCT_DETAIL] missing productId")
      return res.status(400).json({
        message: "productId is required"
      })
    }

    console.log("[GET_PRODUCT_DETAIL] fetching product", productId)

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: {
          select: {
            url: true,
            isPrimary: true,
            order: true
          },
          orderBy: [
            { order: "asc" },
            { createdAt: "asc" }
          ]
        },
        variants: {
          select: {
            id: true,
            size: true,
            availableQuantity: true,
            price: true,
            isActive: true
          },
          orderBy: {
            size: "asc"
          }
        },
        comments: {
          take: 10,
          orderBy: {
            createdAt: "desc"
          },
          select: {
            userId: true,
            userEmail: true,
            comment: true,
            createdAt: true
          }
        }
      }
    })

    if (!product || !product.isActive) {
      console.log("[GET_PRODUCT_DETAIL] product not found or inactive", productId)
      return res.status(404).json({
        message: "Product not found"
      })
    }

    appLogger.info("GET_PRODUCT_DETAIL_SUCCESS", { productId })
    console.log("[GET_PRODUCT_DETAIL] success", productId)

    return res.status(200).json({
      product: {
        id: product.id,
        title: product.title,
        description: product.description,
        category: product.category,
        subCategory: product.subCategory,
        price: product.price,
        defaultImage: product.defaultImage,
        avgRating: product.avgRating,
        ratingCount: product.ratingCount,
        totalQuantity: product.totalQuantity,
        isActive: product.isActive,
        createdAt: product.createdAt,
        images: product.images,
        variants: product.variants,
        comments: product.comments
      }
    })

  } catch (error) {
    errorLogger.error("GET_PRODUCT_DETAIL_FAILED", {
      productId,
      message: error.message,
      stack: error.stack
    })
    console.log("[GET_PRODUCT_DETAIL] failed", productId)

    return res.status(500).json({
      message: "Internal server error"
    })
  }
}
