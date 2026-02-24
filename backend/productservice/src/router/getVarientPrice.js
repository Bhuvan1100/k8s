import prisma from "../config/prismaClient.js"
import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"

export const getVariantPrice = async (req, res) => {
  const { variantId } = req.body

  appLogger.info("GET_VARIANT_PRICE_REQUEST", { variantId })
  console.log("[GET_VARIANT_PRICE] request entered", variantId)

  try {

    if (!variantId) {
      console.log("[GET_VARIANT_PRICE] validation failed", variantId)
      return res.status(400).json({
        message: "variantId is required"
      })
    }

    console.log("[GET_VARIANT_PRICE] fetching variant", variantId)

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId }
    })

    if (!variant || !variant.isActive) {
      console.log("[GET_VARIANT_PRICE] variant not found or inactive", variantId)
      return res.status(404).json({
        message: "Variant not found"
      })
    }

    appLogger.info("GET_VARIANT_PRICE_SUCCESS", { variantId })
    console.log("[GET_VARIANT_PRICE] success", variantId)

    return res.status(200).json({
      currentPrice: variant.salePrice ?? variant.price,
      lowerLimit: variant.lowerLimit,
      upperLimit: variant.upperLimit,
      totalQuantity: variant.totalQuantity,
      reservedQuantity: variant.reservedQuantity,
      availableQuantity: variant.availableQuantity
    })

  } catch (error) {
    errorLogger.error("GET_VARIANT_PRICE_FAILED", {
      variantId,
      message: error.message,
      stack: error.stack
    })
    console.log("[GET_VARIANT_PRICE] failed", variantId)

    return res.status(500).json({
      message: "Internal server error"
    })
  }
}
