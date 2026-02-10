import prisma from "../config/prismaClient.js"

export const getOrderStatus = async (req, res) => {
  try {
    const { orderId, productId } = req.body

    if (!orderId || !productId) {
      return res.status(400).json({
        success: false,
        message: "orderId and productId are required"
      })
    }

    const orderItem = await prisma.orderItem.findFirst({
      where: {
        orderId,
        productId
      },
      select: {
        status: true
      }
    })

    if (!orderItem) {
      return res.status(404).json({
        success: false,
        message: "Order item not found"
      })
    }

    return res.status(200).json({
      success: true,
      status: orderItem.status
    })

  } catch (error) {
    console.error("Get order item status error", error)

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order status"
    })
  }
}
