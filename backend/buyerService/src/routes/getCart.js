import prisma from "../config/prismaClient.js"
import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"

const getCartItems = async (req, res) => {
  const { userId } = req.body

  appLogger.info("GET_CART_ITEMS_REQUEST", { userId })
  console.log("[GET_CART_ITEMS] request entered", userId)

  try {
    const { email } = req.body

    console.log("[GET_CART_ITEMS] upserting user", userId)

    const user = await prisma.user.upsert({
      where: { userId },
      update: { email },
      create: { userId, email }
    })

    console.log("[GET_CART_ITEMS] fetching cart", user.id)

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            productVariantId: true,
            size: true,
            quantity: true,
            priceSnapshot: true,
            totalPrice: true
          }
        }
      }
    })

    if (!cart) {
      console.log("[GET_CART_ITEMS] cart not found", user.id)

      appLogger.info("GET_CART_ITEMS_EMPTY", { userId })

      return res.status(200).json({
        items: [],
        totalPrice: 0
      })
    }

    appLogger.info("GET_CART_ITEMS_SUCCESS", {
      userId,
      cartId: cart.id
    })
    console.log("[GET_CART_ITEMS] success", userId)

    return res.status(200).json({
      cartId: cart.id,
      status: cart.status,
      totalPrice: cart.totalPrice,
      items: cart.items
    })

  } catch (error) {
    errorLogger.error("GET_CART_ITEMS_FAILED", {
      userId,
      message: error.message,
      stack: error.stack
    })
    console.log("[GET_CART_ITEMS] failed", userId)

    return res.status(500).json({
      message: "Failed to fetch cart items"
    })
  }
}

export default getCartItems
