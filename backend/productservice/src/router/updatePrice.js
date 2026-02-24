import prisma from "../config/prismaClient.js"
import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"

export const updateVariantPrice = async (req, res) => {
  const { variant_id, new_price } = req.body

  

  appLogger.info("UPDATE_VARIANT_PRICE_REQUEST", {
    variant_id,
    new_price
  })

  try {

    if (!variant_id || new_price === undefined) {
     
      return res.status(400).json({
        message: "variant_id and new_price are required"
      })
    }

    if (typeof new_price !== "number" || new_price <= 0) {
     
      return res.status(400).json({
        message: "new_price must be a positive number"
      })
    }

    

    const variant = await prisma.productVariant.findUnique({
      where: { id: variant_id }
    })

    if (!variant || !variant.isActive) {
      
      return res.status(404).json({
        message: "Variant not found"
      })
    }

    

    if (
      (variant.lowerLimit && new_price < variant.lowerLimit) ||
      (variant.upperLimit && new_price > variant.upperLimit)
    ) {
     
      return res.status(400).json({
        message: "Proposed price is outside allowed limits"
      })
    }

    

    const updatedVariant = await prisma.productVariant.update({
      where: { id: variant_id },
      data: {
        price: new_price
      }
    })

    

    appLogger.info("UPDATE_VARIANT_PRICE_SUCCESS", {
      variant_id,
      oldPrice: variant.price,
      newPrice: new_price
    })

    return res.status(200).json({
      message: "Price updated successfully",
      variantId: variant_id,
      oldPrice: variant.price,
      newPrice: updatedVariant.price
    })

  } catch (error) {

   

    errorLogger.error("UPDATE_VARIANT_PRICE_FAILED", {
      variant_id,
      new_price,
      message: error.message,
      stack: error.stack
    })

    return res.status(500).json({
      message: "Internal server error"
    })
  }
}