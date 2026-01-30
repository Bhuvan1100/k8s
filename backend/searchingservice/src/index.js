import "dotenv/config";
import express from "express";
import dotenv from "dotenv";
import "./worker/addDeleteProduct.js"
import "./worker/decreaseProduct.js"
import { getProductsByCategory } from "./routes/category.js";
import { getProductsByQuery } from "./routes/query.js";

dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 4005;

app.get("/health", (req, res) => {
  res.json({ status: "Search Service running" });
});

app.post("/products/:category/:subCategory",getProductsByCategory)
app.post("/search/:query",getProductsByQuery)

app.listen(PORT, () => {
  console.log(` Search Service running on port ${PORT}`);
});
