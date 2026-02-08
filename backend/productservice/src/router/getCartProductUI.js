import prisma from "../config/prismaClient.js";

export const getCartProductForUI = async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: "items array is required"
    });
  }

  try {
   
    const productIds = items.map(item => item.productId);

   
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true
      },
      select: {
        id: true,
        title: true,
        defaultImage: true,
        variants: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            price: true,
            salePrice: true,
            availableQuantity: true
          }
        }
      }
    });

    
    const productMap = new Map();
    products.forEach(product => {
      productMap.set(product.id, product);
    });

   
    const response = items
      .map(item => {
        const product = productMap.get(item.productId);
        if (!product) return null;

        const variant = product.variants.find(
          v => v.id === item.productVariantId
        );
        if (!variant) return null;

        return {
          productId: product.id,
          productVariantId: variant.id,
          title: product.title,
          image: product.defaultImage,
          quantity: item.quantity ?? 1,             
          availableQuantity: variant.availableQuantity, 
          price: variant.price,
          salePrice: variant.salePrice
        };
      })
      .filter(Boolean);

    return res.status(200).json(response);

  } catch (err) {
    console.error("GET_CART_PRODUCT_FOR_UI error", err);

    return res.status(500).json({
      message: "Failed to fetch cart products"
    });
  }
};
