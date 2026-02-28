import prisma from "../config/prismaClient.js"
import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"

export const clearCart = async (req, res) => {
  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({
      message: "userId is required"
    })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { userId }
    })

    if (!user) {
      return res.status(200).json({
        message: "No active cart found"
      })
    }

    await prisma.cart.delete({
      where: { userId: user.id } 
    })

    return res.status(200).json({
      message: "Cart cleared successfully"
    })

  } catch (error) {
    if (error.code === "P2025") {
      return res.status(200).json({
        message: "No active cart found"
      })
    }

    return res.status(500).json({
      message: "Failed to clear cart"
    })
  }
}