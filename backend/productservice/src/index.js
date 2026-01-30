import express from "express";
import "dotenv/config";


import { addProduct, deleteProduct } from "./router/product.js";
import { getProductDetail } from "./router/getProduct.js";
import { addComment, addRating } from "./router/reviewProduct.js";
import { softCheckProducts } from "./router/softcheck.js";
import { reserveInventory } from "./router/inventoryReserve.js";

import { startInventoryConsumer } from "./consumer/inventoryDecrease.consumer.js";
import { startInventoryFailureConsumer } from "./consumer/inventoryRelease.consumer.js";

const app = express();
const PORT = process.env.PORT || 4006;

app.use(express.json());

app.post("/seller/product", addProduct);
app.delete("/seller/product/:productId", deleteProduct);

app.post("/product/rate/:productId", addRating);
app.post("/product/comment/:productId", addComment);
app.post("/product/reserve", reserveInventory)

app.get("/product/productdetail/:productId", getProductDetail);
app.post("/product/softcheck", softCheckProducts);

app.get("/health", (req, res) => {
  res.json({ status: "product Domain Service running" });
});

const startServer = async () => {
  await startInventoryConsumer();
  await startInventoryFailureConsumer();

  app.listen(PORT, () => {
    console.log(`Product Service running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start Product Service", error);
  process.exit(1);
});
