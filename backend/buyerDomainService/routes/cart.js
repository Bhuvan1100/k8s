import prisma from "../config/prismaClient";

const addToCart = async (req, res) => {
  const { productId, quantity, price } = req.body;
  const { id: userId, email } = req.user;

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email
    }
  });

  let cart = await prisma.cart.findFirst({
    where: {
      userId: user.id,
      status: "ACTIVE"
    }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId: user.id
      }
    });
  }

  const cartItem = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity,
      priceSnapshot: price
    }
  });

  res.status(201).json(cartItem);
};

export default addToCart;
