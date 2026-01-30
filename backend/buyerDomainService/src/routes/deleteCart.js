import prisma from "../config/prismaClient.js";

const removeCartItem = async (req, res) => {
  const { userId, email, productVariantId } = req.body;

  const user = await prisma.user.upsert({
    where: { userId },
    update: { email },
    create: { userId, email }
  });

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: { items: true }
  });

  if (!cart) {
    return res.status(404).json({
      message: "CART_NOT_FOUND"
    });
  }

  const cartItem = cart.items.find(
    (item) => item.productVariantId === productVariantId
  );

  if (!cartItem) {
    return res.status(404).json({
      message: "ITEM_NOT_FOUND"
    });
  }

  await prisma.cartItem.delete({
    where: { id: cartItem.id }
  });

  await prisma.cart.update({
    where: { id: cart.id },
    data: {
      totalPrice: { decrement: cartItem.totalPrice }
    }
  });

  return res.status(200).json({
    message: "ITEM_REMOVED_SUCCESSFULLY"
  });
};

export default removeCartItem;
