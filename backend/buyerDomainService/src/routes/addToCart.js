import prisma from "../config/prismaClient.js"
import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"
import redis from "../config/redisClient.js"

const addToCart = async (req, res) => {
  const { userId, productVariantId } = req.body

  appLogger.info("ADD_TO_CART_REQUEST", { userId, productVariantId })
  console.log("[ADD_TO_CART] request entered", userId, productVariantId)

  try {
    const {
      email,
      productId,
      size,
      quantity,
      priceSnapshot
    } = req.body

    if (!userId || !productVariantId || !quantity || !priceSnapshot) {
      console.log("[ADD_TO_CART] validation failed", userId, productVariantId)
      return res.status(400).json({
        message: "Invalid add to cart request"
      })
    }

    console.log("[ADD_TO_CART] upserting user", userId)

    const user = await prisma.user.upsert({
      where: { userId },
      update: { email },
      create: { userId, email }
    })

    console.log("[ADD_TO_CART] fetching cart", user.id)

    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true }
    })

    if (!cart) {
      console.log("[ADD_TO_CART] creating cart", user.id)

      cart = await prisma.cart.create({
        data: {
          userId: user.id,
          totalPrice: 0
        },
        include: { items: true }
      })
    }

    const existingItem = cart.items.find(
      item => item.productVariantId === productVariantId
    )

    if (existingItem) {
      console.log("[ADD_TO_CART] variant already in cart", productVariantId)
      return res.status(200).json({
        message: "PRODUCT_VARIANT_ALREADY_IN_CART"
      })
    }

    const totalItemPrice = priceSnapshot * quantity

    console.log("[ADD_TO_CART] creating cart item", productVariantId)

    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        productVariantId,
        size,
        quantity,
        priceSnapshot,
        totalPrice: totalItemPrice
      }
    })

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        totalPrice: { increment: totalItemPrice }
      }
    })

   

    const timestamp = Math.floor(Date.now() / 1000)

    const eventPayload = JSON.stringify({
      userId,
      quantity,
      timestamp
    })

    await redis.zAdd(`cart_events:${productVariantId}`, {
      score: timestamp,
      value: eventPayload
    })
    await redis.zIncrBy("variant_lifetime_score", 1 * quantity, productVariantId)
    await redis.zIncrBy("variant_activity_score", quantity, productVariantId)
   

    appLogger.info("ADD_TO_CART_SUCCESS", {
      userId,
      productVariantId,
      cartItemId: cartItem.id
    })
    console.log("[ADD_TO_CART] success", userId, productVariantId)

    return res.status(201).json(cartItem)

  } catch (error) {
    errorLogger.error("ADD_TO_CART_FAILED", {
      userId,
      productVariantId,
      message: error.message,
      stack: error.stack
    })
    console.log("[ADD_TO_CART] failed", userId, productVariantId)

    return res.status(500).json({
      message: "Failed to add item to cart"
    })
  }
}

export default addToCart
