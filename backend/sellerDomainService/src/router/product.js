import express from "express";
import prisma from "../config/prismaClient.js";
import { productSearchQueue } from "../infra/addProductQueue.js";

const router = express.Router();



export const addProduct = async (req, res) => {
  try {
    const {
      sellerId,
      title,
      description,
      category,
      variants
    } = req.body;

    if (!sellerId || !title || !description || !category) {
      return res.status(400).json({
        message: "Missing required product fields"
      });
    }

    const product = await prisma.product.create({
      data: {
        sellerId,
        title,
        description,
        category,
        isActive: true,
        variants: variants?.length
          ? {
              create: variants.map((variant) => ({
                size: variant.size,
                quantity: variant.quantity
              }))
            }
          : undefined
      },
      include: {
        variants: true
      }
    });

   
    await productSearchQueue.add(
      "index-product",
      {
        productId: product.id,
        sellerId: product.sellerId,
        title: product.title,
        description: product.description,
        category: product.category,
        variants: product.variants,
        isActive: product.isActive,
        action: "CREATE"
      },
      {
        removeOnComplete: true,
        attempts: 3
      }
    );

    return res.status(201).json({
      message: "Product added successfully",
      product
    });
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);

    return res.status(500).json({
      message: "Failed to add product",
      error: error.message
    });
  }
};



export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        message: "productId is required"
      });
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        isActive: false,
        deletedAt: new Date()
      }
    });

    
    await productSearchQueue.add(
      "index-product",
      {
        productId: product.id,
        isActive: false,
        action: "DELETE"
      },
      {
        removeOnComplete: true,
        attempts: 3
      }
    );

    return res.status(200).json({
      message: "Product marked inactive successfully"
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete product",
      error: error.message
    });
  }
};



router.post("/add-product", addProduct);
router.delete("/delete-product/:productId", deleteProduct);

export default router;
