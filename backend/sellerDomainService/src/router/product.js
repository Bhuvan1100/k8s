import express from "express";
import prisma from "../config/prismaClient.js";
import { productSearchQueue } from "../infra/addProductQueue.js";

const router = express.Router();

export const addProduct = async (req, res) => {
  console.log("addProduct request received");

  try {
    const {
      sellerId,
      title,
      description,
      category,
      variants
    } = req.body;

    console.log("request body", req.body);

    if (
      !sellerId ||
      !title ||
      !description ||
      !category ||
      !Array.isArray(variants) ||
      variants.length === 0
    ) {
      console.log("validation failed for addProduct");
      return res.status(400).json({
        message: "Invalid or missing product data"
      });
    }

    console.log("creating product in database");

    const product = await prisma.product.create({
      data: {
        sellerId,
        title,
        description,
        category,
        isActive: true,
        variants: {
          create: variants.map(v => ({
            size: v.size,
            quantity: v.quantity
          }))
        }
      },
      include: {
        variants: true
      }
    });

    console.log("product created with id", product.id);

    console.log("adding job to productSearchQueue for indexing");

    try {
      await productSearchQueue.add(
        "index-product",
        {
          id: product.id,
          title: product.title,
          description: product.description,
          category: product.category,
          isActive: product.isActive,
          availableSizes: product.variants.map(v => v.size),
          createdAt: product.createdAt
        },
        {
          removeOnComplete: true,
          attempts: 3
        }
      );

      console.log("index job added for product", product.id);
    } catch (queueError) {
      console.error("queue failed but product already created", queueError.message);
    }

    return res.status(201).json({
      message: "Product added successfully",
      product
    });

  } catch (error) {
    console.log("error occurred in addProduct");
    console.error(error);

    return res.status(500).json({
      message: "Failed to add product",
      error: error.message
    });
  }
};




export const deleteProduct = async (req, res) => {
  console.log("deleteProduct request received");

  try {
    const { productId } = req.body;

    console.log("productId received", productId);

    if (!productId) {
      console.log("productId missing in request");
      return res.status(400).json({
        message: "productId is required"
      });
    }

    console.log("marking product inactive in database");

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        isActive: false,
      }
    });

    console.log("product marked inactive", product.id);

    console.log("adding delete job to productSearchQueue");

    try {
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

      console.log("delete index job added for product", product.id);
    } catch (queueError) {
      console.error("queue delete failed but db is correct", queueError.message);
    }

    return res.status(200).json({
      message: "Product marked inactive successfully"
    });

  } catch (error) {
    console.log("error occurred in deleteProduct");
    console.error(error);

    return res.status(500).json({
      message: "Failed to delete product",
      error: error.message
    });
  }
};
