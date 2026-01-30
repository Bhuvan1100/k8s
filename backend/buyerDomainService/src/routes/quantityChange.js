import prisma from "../config/prismaClient.js";

const updateCartItemQuantity = async (req, res) => {
  const { userId, email, productVariantId, delta } = req.body;

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

  const deltaItemTotal = cartItem.priceSnapshot * delta;

  const updatedItem = await prisma.cartItem.update({
    where: { id: cartItem.id },
    data: {
      quantity: { increment: delta },
      totalPrice: { increment: deltaItemTotal }
    }
  });

  await prisma.cart.update({
    where: { id: cart.id },
    data: {
      totalPrice: { increment: deltaItemTotal }
    }
  });

  return res.status(200).json(updatedItem);
};

export default updateCartItemQuantity;
