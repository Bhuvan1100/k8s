import Mainmarket from "../Shop/Mainmarket";

export default function WomensCollections(){
    const womensCollectionsData = [
  {
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80",
    category: "saree",
    name: "Women's Saree",
    itemCount: "180+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1617627143750-d86bc393c928?w=400&q=80",
    category: "kurti",
    name: "Women's Kurti",
    itemCount: "220+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80",
    category: "dress",
    name: "Women's Dresses",
    itemCount: "200+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=400&q=80",
    category: "top",
    name: "Women's Tops",
    itemCount: "250+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&q=80",
    category: "tshirt",
    name: "Women's T-Shirts",
    itemCount: "190+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80",
    category: "jeans",
    name: "Women's Jeans",
    itemCount: "180+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&q=80",
    category: "trousers",
    name: "Women's Trousers",
    itemCount: "140+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&q=80",
    category: "skirt",
    name: "Women's Skirts",
    itemCount: "120+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1590330297626-d7aff25a0431?w=400&q=80",
    category: "leggings",
    name: "Women's Leggings",
    itemCount: "150+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=400&q=80",
    category: "ethnicset",
    name: "Women's Ethnic Sets",
    itemCount: "100+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&q=80",
    category: "gown",
    name: "Women's Gowns",
    itemCount: "90+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&q=80",
    category: "blazer",
    name: "Women's Blazers",
    itemCount: "85+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=400&q=80",
    category: "jacket",
    name: "Women's Jackets",
    itemCount: "130+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400&q=80",
    category: "sweater",
    name: "Women's Sweaters",
    itemCount: "140+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1615969022634-c11e65ca6b86?w=400&q=80",
    category: "nightwear",
    name: "Women's Nightwear",
    itemCount: "95+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80",
    category: "activewear",
    name: "Women's Activewear",
    itemCount: "170+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1606392011638-b0fb0c46aca9?w=400&q=80",
    category: "lingerie",
    name: "Women's Lingerie",
    itemCount: "110+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1575361204480-e557e2f28f7f?w=400&q=80",
    category: "swimwear",
    name: "Women's Swimwear",
    itemCount: "70+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80",
    category: "footwear",
    name: "Women's Footwear",
    itemCount: "200+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&q=80",
    category: "accessories",
    name: "Women's Accessories",
    itemCount: "160+ styles"
  }
];

 return(
    <>
        <Mainmarket heading="Womens Collection" productData={womensCollectionsData} />
    </>
 )
}