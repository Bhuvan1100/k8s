import prisma from "../config/prismaClient.js";

export const getCartProductsDetail = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "items array is required",
      });
    }

    const results = await Promise.all(
      items.map(async ({ productId, productVariantId }) => {
        const product = await prisma.product.findFirst({
          where: {
            id: productId,
            isActive: true,
          },
          select: {
            description: true,
            defaultImage: true,
            images: {
              select: {
                url: true,
                isPrimary: true,
                order: true,
              },
              orderBy: [
                { isPrimary: "desc" },
                { order: "asc" },
                { createdAt: "asc" },
              ],
              take: 1,
            },
            variants: {
              where: {
                id: productVariantId,
                isActive: true,
              },
              select: {
                price: true,
                availableQuantity: true,
              },
            },
          },
        });

        if (!product || product.variants.length === 0) {
          return null;
        }

        const variant = product.variants[0];

        return {
          image: product.images[0]?.url || product.defaultImage || null,
          price: variant.price,
          availableQuantity: variant.availableQuantity,
          description: product.description,
        };
      })
    );

    return res.status(200).json({
      items: results.filter(Boolean),
    });
  } catch (error) {
    console.error("getCartProductsDetail error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
