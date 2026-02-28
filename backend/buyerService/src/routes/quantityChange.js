import prisma from "../config/prismaClient.js"
import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"
import redis from "../config/redisClient.js"

const updateCartItemQuantity = async (req, res) => {
  const { userId, productVariantId } = req.body

  appLogger.info("UPDATE_CART_ITEM_REQUEST", { userId, productVariantId })
  console.log("[UPDATE_CART_ITEM] request entered", userId, productVariantId)

  try {
    const { email, delta } = req.body

    console.log("[UPDATE_CART_ITEM] upserting user", userId)

    const user = await prisma.user.upsert({
      where: { userId },
      update: { email },
      create: { userId, email }
    })

    console.log("[UPDATE_CART_ITEM] fetching cart", user.id)

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true }
    })

    if (!cart) {
      console.log("[UPDATE_CART_ITEM] cart not found", user.id)
      return res.status(404).json({
        message: "CART_NOT_FOUND"
      })
    }

    const cartItem = cart.items.find(
      (item) => item.productVariantId === productVariantId
    )

    if (!cartItem) {
      console.log("[UPDATE_CART_ITEM] item not found", productVariantId)
      return res.status(404).json({
        message: "ITEM_NOT_FOUND"
      })
    }

    const deltaItemTotal = cartItem.priceSnapshot * delta

    console.log("[UPDATE_CART_ITEM] updating cart item", cartItem.id)

    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: {
        quantity: { increment: delta },
        totalPrice: { increment: deltaItemTotal }
      }
    })

    console.log("[UPDATE_CART_ITEM] updating cart total", cart.id)

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        totalPrice: { increment: deltaItemTotal }
      }
    })

    
    if (delta > 0) {
      await redis.zIncrBy(
        "variant_activity_score",
        delta, 
        productVariantId
      )
    }


    appLogger.info("UPDATE_CART_ITEM_SUCCESS", {
      userId,
      productVariantId,
      cartItemId: updatedItem.id
    })
    console.log("[UPDATE_CART_ITEM] success", userId, productVariantId)

    return res.status(200).json(updatedItem)

  } catch (error) {
    errorLogger.error("UPDATE_CART_ITEM_FAILED", {
      userId,
      productVariantId,
      message: error.message,
      stack: error.stack
    })
    console.log("[UPDATE_CART_ITEM] failed", userId, productVariantId)

    return res.status(500).json({
      message: "Failed to update cart item"
    })
  }
}

export default updateCartItemQuantity
