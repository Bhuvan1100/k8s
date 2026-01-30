import prisma from "../config/prismaClient.js";

const getCartItems = async (req, res) => {
  const { userId, email } = req.body;

  const user = await prisma.user.upsert({
    where: { userId },
    update: { email },
    create: { userId, email }
  });

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
  });

  if (!cart) {
    return res.status(200).json({
      items: [],
      totalPrice: 0
    });
  }

  return res.status(200).json({
    cartId: cart.id,
    status: cart.status,
    totalPrice: cart.totalPrice,
    items: cart.items
  });
};

export default getCartItems;
