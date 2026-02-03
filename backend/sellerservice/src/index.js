import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { startSellerOrderConsumer } from "./consumer/sellerOrder.consumer.js";
import { sellerProductWorker } from "./worker/addItems.js";
import { createSellerDetail } from "./routes/sellerDetail.js";
sellerProductWorker

const app = express();
const PORT = process.env.PORT || 4007;

app.use(express.json());

app.post("/seller/sellerdetail",createSellerDetail)

const startServer = async () => {
  
  await startSellerOrderConsumer();

  app.listen(PORT, () => {
    console.log(`Seller Service running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start Seller Service", error);
  process.exit(1);
});
