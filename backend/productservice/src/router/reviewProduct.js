import prisma from "../config/prismaClient.js";


export const addComment = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId, userEmail, comment } = req.body;

    if (!productId || !userId || !userEmail || !comment) {
      return res.status(400).json({
        message: "productId, userId, userEmail and comment are required"
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || !product.isActive) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    await prisma.productComment.create({
      data: {
        productId,
        userId,
        userEmail,
        comment
      }
    });

    return res.status(201).json({
      message: "Comment added successfully"
    });

  } catch (error) {
    console.error("addComment error", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};



export const addRating = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId, userEmail, rating } = req.body;

    if (!productId || !userId || !userEmail || rating == null) {
      return res.status(400).json({
        message: "productId, userId, userEmail and rating are required"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || !product.isActive) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    // prevent duplicate rating by same user
    const existingRating = await prisma.productRating.findFirst({
      where: {
        productId,
        userId
      }
    });

    if (existingRating) {
      return res.status(409).json({
        message: "User has already rated this product"
      });
    }

    // create rating
    await prisma.productRating.create({
      data: {
        productId,
        userId,
        userEmail,
        rating
      }
    });

    // recalculate aggregates
    const aggregate = await prisma.productRating.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true }
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        avgRating: aggregate._avg.rating || 0,
        ratingCount: aggregate._count.rating
      }
    });

    return res.status(201).json({
      message: "Product rated successfully",
      avgRating: aggregate._avg.rating,
      ratingCount: aggregate._count.rating
    });

  } catch (error) {
    console.error("addRating error", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};
