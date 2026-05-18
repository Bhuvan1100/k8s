import React from "react";
import CategoryCard from "../Cards/Card1";
import { Link } from "react-router-dom";

const MoreOptions = ({ name = "" }) => {
  const categories = {
    Kids: {
      image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&q=80",
      category: "Kids Collection",
      name: "Kids Fashion",
      itemCount: "120+ styles"
    },
    Mens: {
      image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=80",
      category: "Mens Collection",
      name: "Mens Fashion",
      itemCount: "180+ styles"
    },
    Womens: {
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
      category: "Womens Collection",
      name: "Womens Fashion",
      itemCount: "200+ styles"
    }
  };

  const otherCategories = Object.keys(categories).filter(
    (cat) => cat.toLowerCase() !== name.toLowerCase()
  );

  const handleCategoryClick = (categoryName) => {
    console.log(`Navigate to ${categoryName} Collection`);
    // router.push(`/collections/${categoryName.toLowerCase()}`)
  };

  return (
    <div className="w-1/2 max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-3xl pl-10 font-bold text-center mb-8 text-gray-900">
        Explore More Collections
      </h2>

      <div
        className={`grid gap-10 ${otherCategories.length === 2
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1 md:grid-cols-3"
          }`}
      >
        {otherCategories.map((key) => {
          const data = categories[key];

          return (
            <Link
              key={key}
              to={`/${data.name.split(" ")[0]}collections`}
              className={`block ${otherCategories.length === 2 ? "md:scale-105" : ""
                }`}
            >
              <CategoryCard {...data} />
            </Link>
          );
        })}
      </div>
    </div>

  );
};

export default MoreOptions;
