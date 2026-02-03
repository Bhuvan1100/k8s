import prisma from "../config/prismaClient.js"
import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"

const removeCartItem = async (req, res) => {
  const { userId, productVariantId } = req.body

  appLogger.info("REMOVE_CART_ITEM_REQUEST", { userId, productVariantId })
  console.log("[REMOVE_CART_ITEM] request entered", userId, productVariantId)

  try {
    const { email } = req.body

    console.log("[REMOVE_CART_ITEM] upserting user", userId)

    const user = await prisma.user.upsert({
      where: { userId },
      update: { email },
      create: { userId, email }
    })

    console.log("[REMOVE_CART_ITEM] fetching cart", user.id)

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true }
    })

    if (!cart) {
      console.log("[REMOVE_CART_ITEM] cart not found", user.id)
      return res.status(404).json({
        message: "CART_NOT_FOUND"
      })
    }

    const cartItem = cart.items.find(
      (item) => item.productVariantId === productVariantId
    )

    if (!cartItem) {
      console.log("[REMOVE_CART_ITEM] item not found", productVariantId)
      return res.status(404).json({
        message: "ITEM_NOT_FOUND"
      })
    }

    console.log("[REMOVE_CART_ITEM] deleting cart item", cartItem.id)

    await prisma.cartItem.delete({
      where: { id: cartItem.id }
    })

    console.log("[REMOVE_CART_ITEM] updating cart total", cart.id)

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        totalPrice: { decrement: cartItem.totalPrice }
      }
    })

    appLogger.info("REMOVE_CART_ITEM_SUCCESS", {
      userId,
      productVariantId,
      cartItemId: cartItem.id
    })
    console.log("[REMOVE_CART_ITEM] success", userId, productVariantId)

    return res.status(200).json({
      message: "ITEM_REMOVED_SUCCESSFULLY"
    })

  } catch (error) {
    errorLogger.error("REMOVE_CART_ITEM_FAILED", {
      userId,
      productVariantId,
      message: error.message,
      stack: error.stack
    })
    console.log("[REMOVE_CART_ITEM] failed", userId, productVariantId)

    return res.status(500).json({
      message: "Failed to remove item from cart"
    })
  }
}

export default removeCartItem
