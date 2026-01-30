export const checkoutCart = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await prisma.user.findUnique({
      where: { userId }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    

    return res.status(200).json({
      cartId: cart.id,
      items: cart.items
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Checkout failed"
    });
  }
};
