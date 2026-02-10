import prisma from "../config/prismaClient.js"
import { productSearchQueue } from "../infra/addProductQueue.js"
import { addItemToSellerQueue } from "../infra/additemToSeller.js"
import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"

export const addProduct = async (req, res) => {
  const { userId } = req.body

  appLogger.info("ADD_PRODUCT_REQUEST", { userId })
  console.log("[ADD_PRODUCT] request entered", userId)

  try {
    const {
      title,
      description,
      category,
      subCategory,
      variants,
      images
    } = req.body

    if (
      !userId ||
      !title ||
      !description ||
      !category ||
      !subCategory ||
      !Array.isArray(variants) ||
      variants.length === 0 ||
      !Array.isArray(images) ||
      images.length === 0
    ) {
      console.log("[ADD_PRODUCT] validation failed", userId)
      return res.status(400).json({ message: "Invalid or missing product data" })
    }

    console.log("[ADD_PRODUCT] validation passed", userId)

    const totalQuantity = variants.reduce(
      (sum, v) => sum + (v.totalQuantity || 0),
      0
    )

    const defaultImage = images[0].url

    let price = null
    const sizePriority = ["SMALL", "MEDIUM", "LARGE"]

    for (const size of sizePriority) {
      const variant = variants.find(v => v.size === size)
      if (variant && variant.price != null) {
        price = variant.price
        break
      }
    }

    if (price == null) {
      console.log("[ADD_PRODUCT] price resolution failed", userId)
      return res.status(400).json({
        message: "At least one variant must have a price"
      })
    }

    console.log("[ADD_PRODUCT] creating product", userId)

    const product = await prisma.product.create({
      data: {
        userId,
        title,
        description,
        category,
        subCategory,
        defaultImage,
        totalQuantity,
        price,
        variants: {
          create: variants.map(v => ({
            size: v.size,
            totalQuantity: v.totalQuantity,
            reservedQuantity: 0,
            availableQuantity: v.totalQuantity,
            price: v.price
          }))
        },
        images: {
          create: images.map((img, index) => ({
            url: img.url,
            isPrimary: index === 0
          }))
        }
      },
      include: { variants: true }
    })

    appLogger.info("ADD_PRODUCT_CREATED", {
      userId,
      productId: product.id
    })
    console.log("[ADD_PRODUCT] product created", product.id)

    productSearchQueue.add(
      "index-product",
      {
        action: "ADD",
        document: {
          id: product.id,
          title: product.title,
          description: product.description,
          category: product.category,
          subCategory: product.subCategory,
          mainImage: product.defaultImage,
          totalQuantity: product.totalQuantity,
          isInStock: product.totalQuantity > 0,
          price: product.price,
          avgRating: product.avgRating,
          ratingCount: product.ratingCount,
          userId: product.userId,
          isActive: product.isActive,
          createdAt: product.createdAt.getTime()
        }
      },
      { removeOnComplete: true, attempts: 3 }
    ).catch(err => {
      errorLogger.error("ADD_PRODUCT_SEARCH_QUEUE_ERROR", {
        productId: product.id,
        message: err.message
      })
      console.log("[ADD_PRODUCT] search queue failed", product.id)
    })

    addItemToSellerQueue.add(
      "add-product-to-seller",
      {
        action: "ADD",
        sellerUserId: product.userId,
        productId: product.id,
        variants: product.variants.map(v => ({
          productVariantId: v.id,
          size: v.size
        })),
        isActive: product.isActive
      },
      { removeOnComplete: true, attempts: 3 }
    ).catch(err => {
      errorLogger.error("ADD_PRODUCT_SELLER_QUEUE_ERROR", {
        productId: product.id,
        message: err.message
      })
      console.log("[ADD_PRODUCT] seller queue failed", product.id)
    })

    console.log("[ADD_PRODUCT] success", product.id)
    return res.status(201).json({
      message: "Product added successfully",
      productId: product.id
    })

  } catch (error) {
    if (error.code === "P2002") {
      errorLogger.error("ADD_PRODUCT_FAILED", {
      userId,
      message: error.message,
      stack: error.stack
      })
      console.log("[ADD_PRODUCT] failed", userId)

      if (error.code === "P2002") {
        return res.status(409).json({
          message: "Product already exists for this user"
        })
      }
    }

    

    return res.status(500).json({ message: "Failed to add product" })
  }
}

export const deleteProduct = async (req, res) => {
  const { productId } = req.params

  appLogger.info("DELETE_PRODUCT_REQUEST", { productId })
  console.log("[DELETE_PRODUCT] request entered", productId)

  try {
    if (!productId) {
      console.log("[DELETE_PRODUCT] missing productId")
      return res.status(400).json({ message: "productId is required" })
    }

    console.log("[DELETE_PRODUCT] deactivating product", productId)

    const product = await prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
      include: { variants: true }
    })

    productSearchQueue.add(
      "index-product",
      {
        action: "DELETE",
        document: {
          id: product.id,
          isActive: false
        }
      },
      { removeOnComplete: true, attempts: 3 }
    ).catch(err => {
      errorLogger.error("DELETE_PRODUCT_SEARCH_QUEUE_ERROR", {
        productId,
        message: err.message
      })
      console.log("[DELETE_PRODUCT] search queue failed", productId)
    })

    addItemToSellerQueue.add(
      "add-product-to-seller",
      {
        action: "DELETE",
        userId: product.userId,
        productId: product.id,
        isActive: false
      },
      { removeOnComplete: true, attempts: 3 }
    ).catch(err => {
      errorLogger.error("DELETE_PRODUCT_SELLER_QUEUE_ERROR", {
        productId,
        message: err.message
      })
      console.log("[DELETE_PRODUCT] seller queue failed", productId)
    })

    appLogger.info("DELETE_PRODUCT_SUCCESS", { productId })
    console.log("[DELETE_PRODUCT] success", productId)

    return res.status(200).json({ message: "Product deleted successfully" })

  } catch (error) {
    errorLogger.error("DELETE_PRODUCT_FAILED", {
      productId,
      message: error.message,
      stack: error.stack
    })
    console.log("[DELETE_PRODUCT] failed", productId)

    return res.status(500).json({
      message: "Failed to delete product"
    })
  }
}
