import prisma from "../config/prismaClient.js";

export const softCheckProducts = async (req, res) => {
  console.log("[softCheckProducts] Request received");

  try {
    const { items } = req.body;

    console.log("[softCheckProducts] Incoming items:", items);

    if (!items || items.length === 0) {
      console.log("[softCheckProducts] No items provided in request");
      return res.status(400).json({
        message: "No items provided",
        canProceed: false
      });
    }

    let subtotal = 0;
    const previewItems = [];

    for (const item of items) {
      console.log("[softCheckProducts] Checking item", {
        productVariantId: item.productVariantId,
        quantity: item.quantity
      });

      const variant = await prisma.productVariant.findUnique({
        where: {
          id: item.productVariantId
        },
        include: {
          product: {
            select: {
              title: true,
              defaultImage: true,
              isActive: true
            }
          }
        }
      });

      console.log("[softCheckProducts] Variant fetched", variant?.id);

      if (!variant) {
        console.log("[softCheckProducts] Variant not found", item.productVariantId);
        return res.status(400).json({
          message: "Product variant not found",
          productVariantId: item.productVariantId,
          canProceed: false
        });
      }

      if (!variant.isActive) {
        console.log("[softCheckProducts] Variant inactive", variant.id);
        return res.status(400).json({
          message: "Product variant inactive",
          productVariantId: variant.id,
          canProceed: false
        });
      }

      if (!variant.product.isActive) {
        console.log("[softCheckProducts] Product inactive", variant.productId);
        return res.status(400).json({
          message: "Product not available",
          productVariantId: variant.id,
          canProceed: false
        });
      }

      console.log("[softCheckProducts] Stock check", {
        availableQuantity: variant.availableQuantity,
        requestedQuantity: item.quantity
      });

      if (variant.availableQuantity < item.quantity) {
        console.log("[softCheckProducts] Insufficient stock", variant.id);
        return res.status(400).json({
          message: "Insufficient stock",
          productVariantId: variant.id,
          availableQuantity: variant.availableQuantity,
          canProceed: false
        });
      }

      const price = variant.salePrice ?? variant.price ?? 0;
      const totalPrice = price * item.quantity;

      console.log("[softCheckProducts] Price calculation", {
        price,
        quantity: item.quantity,
        totalPrice
      });

      subtotal += totalPrice;

      previewItems.push({
        productId: variant.productId,
        productVariantId: variant.id,
        size: variant.size,
        title: variant.product.title,
        image: variant.product.defaultImage,
        price,
        quantity: item.quantity,
        totalPrice,
        availableQuantity: variant.availableQuantity,
        available: true
      });

      console.log("[softCheckProducts] Item added to preview", variant.id);
    }

    console.log("[softCheckProducts] Soft check completed");
    console.log("[softCheckProducts] Subtotal", subtotal);

    return res.status(200).json({
      items: previewItems,
      subtotal,
      canProceed: true
    });

  } catch (error) {
    console.error("[softCheckProducts] Error", error);
    return res.status(500).json({
      message: "Product availability check failed"
    });
  }
};
