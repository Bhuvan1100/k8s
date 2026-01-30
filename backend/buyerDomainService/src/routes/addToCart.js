import prisma from "../config/prismaClient.js";

const addToCart = async (req, res) => {
  console.log("request reached");

  const {
    userId,
    email,
    productId,
    productVariantId,
    size,
    quantity,
    priceSnapshot
  } = req.body;

  const user = await prisma.user.upsert({
    where: { userId },
    update: { email },
    create: { userId, email }
  });

  let cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: { items: true }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId: user.id,
        totalPrice: 0
      },
      include: { items: true }
    });
  }

  const existingItem = cart.items.find(
    (item) =>
      item.productVariantId === productVariantId
  );

  if (existingItem) {
    return res.status(200).json({
      message: "PRODUCT_VARIANT_ALREADY_IN_CART"
    });
  }

  const totalItemPrice = priceSnapshot * quantity;

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
  });

  await prisma.cart.update({
    where: { id: cart.id },
    data: {
      totalPrice: { increment: totalItemPrice }
    }
  });

  return res.status(201).json(cartItem);
};

export default addToCart;
