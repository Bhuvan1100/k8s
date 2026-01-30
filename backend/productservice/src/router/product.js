import prisma from "../config/prismaClient.js";
import { productSearchQueue } from "../infra/addProductQueue.js";
import { addItemToSellerQueue } from "../infra/additemToSeller.js";

export const addProduct = async (req, res) => {
  console.log("[addProduct] Incoming request", {
    method: req.method,
    path: req.originalUrl,
    body: req.body
  });

  try {
    const {
      sellerId,
      title,
      description,
      category,
      subCategory,
      variants,
      images
    } = req.body;

    if (
      !sellerId ||
      !title ||
      !description ||
      !category ||
      !subCategory ||
      !Array.isArray(variants) ||
      variants.length === 0 ||
      !Array.isArray(images) ||
      images.length === 0
    ) {
      console.log("[addProduct] Response 400 - invalid product data");
      return res.status(400).json({
        message: "Invalid or missing product data"
      });
    }

    const totalQuantity = variants.reduce(
      (sum, v) => sum + (v.totalQuantity || 0),
      0
    );

    const defaultImage = images[0].url;

    let price = null;
    const sizePriority = ["SMALL", "MEDIUM", "LARGE"];

    for (const size of sizePriority) {
      const variant = variants.find(v => v.size === size);
      if (variant) {
        price = variant.salePrice ?? variant.price;
        if (price != null) break;
      }
    }

    if (price == null) {
      console.log("[addProduct] Response 400 - no price in variants");
      return res.status(400).json({
        message: "At least one variant must have a price"
      });
    }

    const product = await prisma.product.create({
      data: {
        sellerId,
        title,
        description,
        category,
        subCategory,
        defaultImage,
        totalQuantity,
        price,
        variants: {
          create: variants.map(v => ({
            size: v.size,
            totalQuantity: v.totalQuantity,
            reservedQuantity: 0,
            availableQuantity: v.totalQuantity,
            price: v.price ?? null,
            salePrice: v.salePrice ?? null
          }))
        },
        images: {
          create: images.map((img, index) => ({
            url: img.url,
            isPrimary: index === 0
          }))
        }
      },
      include: {
        variants: true
      }
    });

    try {
      await productSearchQueue.add(
        "index-product",
        {
          action: "ADD",
          document: {
            id: product.id,
            title: product.title,
            description: product.description,
            category: product.category,
            subCategory: product.subCategory,
            mainImage: product.defaultImage,
            totalQuantity: product.totalQuantity,
            isInStock: product.totalQuantity > 0,
            price: product.price,
            avgRating: product.avgRating,
            ratingCount: product.ratingCount,
            sellerId: product.sellerId,
            isActive: product.isActive,
            createdAt: product.createdAt.getTime()
          }
        },
        {
          removeOnComplete: true,
          attempts: 3
        }
      );
    } catch (queueError) {
      console.error("[addProduct] Search queue error", queueError.message);
    }

    try {
      await addItemToSellerQueue.add(
        "add-product-to-seller",
        {
          action: "ADD",
          sellerId: product.sellerId,
          productId: product.id,
          variants: product.variants.map(v => ({
            productVariantId: v.id,
            size: v.size
          })),
          isActive: product.isActive
        },
        {
          removeOnComplete: true,
          attempts: 3
        }
      );
    } catch (queueError) {
      console.error("[addProduct] Seller queue error", queueError.message);
    }

    console.log("[addProduct] Response 201 - product created", {
      productId: product.id
    });

    return res.status(201).json({
      message: "Product added successfully",
      productId: product.id
    });

  } catch (error) {
    console.error("[addProduct] Internal error", error);
    console.log("[addProduct] Response 500");
    return res.status(500).json({
      message: "Failed to add product",
      error: error.message
    });
  }
};

export const deleteProduct = async (req, res) => {
  console.log("[deleteProduct] Incoming request", {
    method: req.method,
    path: req.originalUrl,
    params: req.params
  });

  try {
    const productId = req.params.productId;

    if (!productId) {
      console.log("[deleteProduct] Response 400 - missing productId");
      return res.status(400).json({
        message: "productId is required"
      });
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
      include: { variants: true }
    });

    try {
      await productSearchQueue.add(
        "index-product",
        {
          action: "DELETE",
          document: {
            id: product.id,
            isActive: false
          }
        },
        {
          removeOnComplete: true,
          attempts: 3
        }
      );
    } catch (queueError) {
      console.error("[deleteProduct] Search queue error", queueError.message);
    }

    try {
      await addItemToSellerQueue.add(
        "add-product-to-seller",
        {
          action: "DELETE",
          sellerId: product.sellerId,
          productId: product.id,
          isActive: false
        },
        {
          removeOnComplete: true,
          attempts: 3
        }
      );
    } catch (queueError) {
      console.error("[deleteProduct] Seller queue error", queueError.message);
    }

    console.log("[deleteProduct] Response 200 - product deactivated", {
      productId: product.id
    });

    return res.status(200).json({
      message: "Product deleted successfully"
    });

  } catch (error) {
    console.error("[deleteProduct] Internal error", error);
    console.log("[deleteProduct] Response 500");
    return res.status(500).json({
      message: "Failed to delete product",
      error: error.message
    });
  }
}; 