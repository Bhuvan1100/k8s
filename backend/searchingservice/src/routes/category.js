import { meiliClient } from "../infra/meilisearch.js";

const CATEGORY_MAP = {
  men: "MEN",
  women: "WOMEN",
  kids: "KIDS",
};

const SUBCATEGORY_MAP = {
  men: {
    tshirt: "MEN_TSHIRT",
    shirt: "MEN_SHIRT",
    jeans: "MEN_JEANS",
    trousers: "MEN_TROUSERS",
    shorts: "MEN_SHORTS",
    kurta: "MEN_KURTA",
    ethnicset: "MEN_ETHNIC_SET",
    jacket: "MEN_JACKET",
    hoodie: "MEN_HOODIE",
    sweatshirt: "MEN_SWEATSHIRT",
    blazer: "MEN_BLAZER",
    suit: "MEN_SUIT",
    trackpants: "MEN_TRACK_PANTS",
    activewear: "MEN_ACTIVEWEAR",
    innerwear: "MEN_INNERWEAR",
    sleepwear: "MEN_SLEEPWEAR",
    swimwear: "MEN_SWIMWEAR",
    footwear: "MEN_FOOTWEAR",
    sandals: "MEN_SANDALS",
    accessories: "MEN_ACCESSORIES",
  },

  women: {
    saree: "WOMEN_SAREE",
    kurti: "WOMEN_KURTI",
    dress: "WOMEN_DRESS",
    top: "WOMEN_TOP",
    tshirt: "WOMEN_TSHIRT",
    jeans: "WOMEN_JEANS",
    trousers: "WOMEN_TROUSERS",
    skirt: "WOMEN_SKIRT",
    leggings: "WOMEN_LEGGINGS",
    ethnicset: "WOMEN_ETHNIC_SET",
    gown: "WOMEN_GOWN",
    blazer: "WOMEN_BLAZER",
    jacket: "WOMEN_JACKET",
    sweater: "WOMEN_SWEATER",
    nightwear: "WOMEN_NIGHTWEAR",
    activewear: "WOMEN_ACTIVEWEAR",
    lingerie: "WOMEN_LINGERIE",
    swimwear: "WOMEN_SWIMWEAR",
    footwear: "WOMEN_FOOTWEAR",
    accessories: "WOMEN_ACCESSORIES",
  },

  kids: {
    tshirt: "KIDS_TSHIRT",
    shirt: "KIDS_SHIRT",
    jeans: "KIDS_JEANS",
    shorts: "KIDS_SHORTS",
    dress: "KIDS_DRESS",
    ethnicwear: "KIDS_ETHNIC_WEAR",
    sleepwear: "KIDS_SLEEPWEAR",
    footwear: "KIDS_FOOTWEAR",
    toys: "KIDS_TOYS",
    accessories: "KIDS_ACCESSORIES",
  },
};


export const getProductsByCategory = async (req, res) => {
  try {
    const { category, subCategory } = req.params;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = 10;
    const offset = (page - 1) * limit;

    const mainCategory = CATEGORY_MAP[category?.toLowerCase()];
    if (!mainCategory) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const filters = [
      `category = "${mainCategory}"`,
      `isActive = true`,
      `isInStock = true`
    ];

    if (subCategory) {
      const mappedSub =
        SUBCATEGORY_MAP[category.toLowerCase()]?.[subCategory.toLowerCase()];

      if (!mappedSub) {
        return res.status(400).json({ message: "Invalid subCategory" });
      }

      filters.push(`subCategory = "${mappedSub}"`);
    }

    const result = await meiliClient.index("products").search("", {
      filter: filters.join(" AND "),
      limit,
      offset
    });

    const products = result.hits.map(p => ({
      id: p.id,
      description:p.description,
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
    console.error("getProductsByCategory error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
