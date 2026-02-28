import prisma from "../config/prismaClient.js"
import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"

export const checkoutCart = async (req, res) => {
  const { userId } = req.body

  appLogger.info("CHECKOUT_CART_REQUEST", { userId })
  console.log("[CHECKOUT_CART] request entered", userId)

  try {
    if (!userId) {
      console.log("[CHECKOUT_CART] missing userId")
      return res.status(400).json({ message: "userId is required" })
    }

    console.log("[CHECKOUT_CART] fetching user", userId)

    const user = await prisma.user.findUnique({
      where: { userId }
    })

    if (!user) {
      console.log("[CHECKOUT_CART] user not found", userId)
      return res.status(404).json({ message: "User not found" })
    }

    console.log("[CHECKOUT_CART] fetching cart", user.id)

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          select: {
            productId: true,
            productVariantId: true,
            size: true,
            quantity: true
          }
        }
      }
    })

    if (!cart || cart.items.length === 0) {
      console.log("[CHECKOUT_CART] cart empty", user.id)
      return res.status(400).json({ message: "Cart is empty" })
    }

    appLogger.info("CHECKOUT_CART_SUCCESS", {
      userId,
      cartId: cart.id
    })
    console.log("[CHECKOUT_CART] success", userId)

    return res.status(200).json({
      cartId: cart.id,
      items: cart.items
    })

  } catch (error) {
    errorLogger.error("CHECKOUT_CART_FAILED", {
      userId,
      message: error.message,
      stack: error.stack
    })
    console.log("[CHECKOUT_CART] failed", userId)

    return res.status(500).json({
      message: "Checkout failed"
    })
  }
}
