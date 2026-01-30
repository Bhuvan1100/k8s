import { meiliClient } from "../infra/meilisearch.js";

export const getProductsByQuery = async (req, res) => {
  try {
    const { query } = req.params;
    console.log(req.originalUrl)
    if (!query || !query.trim()) {
      return res.status(400).json({ message: "Query is required" });
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = 10;
    const offset = (page - 1) * limit;

    const result = await meiliClient.index("products").search(query, {
      filter: `isActive = true AND isInStock = true`,
      limit,
      offset
    });

    const products = result.hits.map(p => ({
      id: p.id,
      title: p.title,
      image: p.mainImage,
      avgRating: p.avgRating,
      ratingCount: p.ratingCount,
      totalQuantity: p.totalQuantity,
      isInStock: p.isInStock,
      price: p.price
    }));

    return res.json({
      products,
      pagination: {
        page,
        limit,
        totalProducts: result.estimatedTotalHits,
        totalPages: Math.ceil(result.estimatedTotalHits / limit)
      }
    });
  } catch (error) {
    console.error("getProductsByQuery error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
