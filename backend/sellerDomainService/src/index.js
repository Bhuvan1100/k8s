import express from "express";
import dotenv from "dotenv";

import { addProduct, deleteProduct } from "./router/product.js";

dotenv.config();

const app = express();
app.use(express.json());


app.post("/seller/product", addProduct)
app.delete("/seller/product",deleteProduct)



app.get("/health", (req, res) => {
  res.json({ status: "Seller Domain Service running" });
});


app.listen(4003, () => {
  console.log(`Seller Domain Service running on port 4003`);
});
