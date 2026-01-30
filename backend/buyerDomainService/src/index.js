import express from "express";
import accessLoggerMiddleware from "./middleware/accessLogger.js";
import addToCart from "./routes/addToCart.js";
import updateCartItemQuantity from "./routes/quantityChange.js";
import removeCartItem from "./routes/deleteCart.js";
import getCartItems from "./routes/getCart.js";
import { checkoutCart } from "./routes/cartcheckout.js";
import { startBuyerOrderConsumer } from "./consumer/buyerOrder.consumer.js";

const app = express();
const PORT = process.env.PORT || 4002;

app.use(express.json());
app.use(accessLoggerMiddleware);

app.post("/buyer/cart/additem", addToCart);
app.patch("/buyer/cart/update", updateCartItemQuantity);
app.delete("/buyer/cart/delete", removeCartItem);
app.post("/buyer/cart/getcart", getCartItems);
app.post("/buyer/cart/cartcheckout", checkoutCart);

const startServer = async () => {
  await startBuyerOrderConsumer();

  app.listen(PORT, () => {
    console.log(`Buyer Domain Service running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start Buyer Service", error);
  process.exit(1);
});
