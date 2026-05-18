import Mainmarket from "../Shop/Mainmarket";

export default function KidsCollections(){
    const kidsCollectionsData = [
  {
    image: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=400&q=80",
    category: "tshirt",
    name: "Kids T-Shirts",
    itemCount: "180+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&q=80",
    category: "shirt",
    name: "Kids Shirts",
    itemCount: "140+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=400&q=80",
    category: "jeans",
    name: "Kids Jeans",
    itemCount: "120+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&q=80",
    category: "shorts",
    name: "Kids Shorts",
    itemCount: "110+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&q=80",
    category: "dress",
    name: "Kids Dresses",
    itemCount: "150+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1600673203925-d6d7ab812061?w=400&q=80",
    category: "ethnicwear",
    name: "Kids Ethnic Wear",
    itemCount: "90+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=400&q=80",
    category: "sleepwear",
    name: "Kids Sleepwear",
    itemCount: "100+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80",
    category: "footwear",
    name: "Kids Footwear",
    itemCount: "160+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80",
    category: "toys",
    name: "Kids Toys",
    itemCount: "200+ styles"
  },
  {
    image: "https://images.unsplash.com/photo-1609873814058-a8928d6d6196?w=400&q=80",
    category: "accessories",
    name: "Kids Accessories",
    itemCount: "130+ styles"
  }
];

 return(
    <>
        <Mainmarket heading="Kids Collection" productData={kidsCollectionsData} />
    </>
 )
}