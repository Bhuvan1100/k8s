import Mainmarket from "../Shop/Mainmarket";

export default function MensCollections(){
    const menCollectionsData = [
  {
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&q=80",
    category: "tshirt",  // ✅ Just the subcategory name
    name: "Men's T-Shirts",
    itemCount: "200+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80",
    category: "shirt",
    name: "Men's Shirts",
    itemCount: "180+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=400&q=80",
    category: "jeans",
    name: "Men's Jeans",
    itemCount: "150+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&q=80",
    category: "trousers",
    name: "Men's Trousers",
    itemCount: "120+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80",
    category: "shorts",
    name: "Men's Shorts",
    itemCount: "100+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1610652495223-f735c1d95c00?w=400&q=80",
    category: "kurta",
    name: "Men's Kurta",
    itemCount: "90+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1622122201714-77da0ca8e5d2?w=400&q=80",
    category: "ethnicset",
    name: "Men's Ethnic Sets",
    itemCount: "75+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",
    category: "jacket",
    name: "Men's Jackets",
    itemCount: "130+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80",
    category: "hoodie",
    name: "Men's Hoodies",
    itemCount: "140+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=400&q=80",
    category: "sweatshirt",
    name: "Men's Sweatshirts",
    itemCount: "110+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80",
    category: "blazer",
    name: "Men's Blazers",
    itemCount: "70+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80",
    category: "suit",
    name: "Men's Suits",
    itemCount: "60+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80",
    category: "trackpants",
    name: "Men's Track Pants",
    itemCount: "130+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=400&q=80",
    category: "activewear",
    name: "Men's Activewear",
    itemCount: "160+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80",
    category: "innerwear",
    name: "Men's Innerwear",
    itemCount: "95+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1584441696754-6ce0e0ac8501?w=400&q=80",
    category: "sleepwear",
    name: "Men's Sleepwear",
    itemCount: "80+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&q=80",
    category: "swimwear",
    name: "Men's Swimwear",
    itemCount: "50+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    category: "footwear",
    name: "Men's Footwear",
    itemCount: "220+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80",
    category: "sandals",
    name: "Men's Sandals",
    itemCount: "85+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
    category: "accessories",
    name: "Men's Accessories",
    itemCount: "150+ styles"
  }
];

 return(
    <>
        <Mainmarket heading="Mens Collection" productData={menCollectionsData} />
    </>
 )
}