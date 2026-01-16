import prisma from "../config/prismaClient.js";
import { inventoryQueue } from "../infra/inventoryQueue.js";

export const inventoryCheck = async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Items array is required",
    });
  }

  try {
    await prisma.$transaction(async (tx) => {
     
      const sortedItems = [...items].sort((a, b) =>
        a.productId.localeCompare(b.productId)
      );

      
      for (const item of sortedItems) {
        const result = await tx.productVariant.updateMany({
          where: {
            productId: item.productId,
            size: item.size,
            quantity: {
              gte: item.quantity, 
            },
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

       
        if (result.count === 0) {
          throw new Error("INSUFFICIENT_INVENTORY");
        }
      }
    });

    
    await inventoryQueue.add("decrement-inventory", { items });

    return res.status(200).json({
      success: true,
      message: "All products available and inventory reserved",
    });
  } catch (error) {
    if (error.message === "INSUFFICIENT_INVENTORY") {
      return res.status(409).json({
        success: false,
        message: "One or more products are out of stock",
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
