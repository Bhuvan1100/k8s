import "dotenv/config"
import express from "express"

import accessLoggerMiddleware from "./middleware/accessLogger.js"
import { strictRequestIdMiddleware } from "./middleware/strictReqIdmiddleware.js"
import errorHandlerMiddleware from "./middleware/errorHandler.js"

import addToCart from "./routes/addToCart.js"
import updateCartItemQuantity from "./routes/quantityChange.js"
import removeCartItem from "./routes/deleteCart.js"
import getCartItems from "./routes/getCart.js"
import { checkoutCart } from "./routes/cartcheckout.js"
import { getBuyerOrders } from "./routes/getBuyerOrders.js"

import { startBuyerOrderConsumer } from "./consumer/buyerOrder.consumer.js"
import "./worker/updateOrderStatus.js"

const app = express()
const port = process.env.PORT || 4002

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "BUYER_SERVICE"
  })
})

app.use(express.json())
app.use(accessLoggerMiddleware)
app.use(strictRequestIdMiddleware)

app.post("/buyer/cart/additem", addToCart)
app.patch("/buyer/cart/update", updateCartItemQuantity)
app.delete("/buyer/cart/delete", removeCartItem)
app.post("/buyer/cart/getcart", getCartItems)
app.post("/buyer/cart/cartcheckout", checkoutCart)
app.post("/buyer/orders",getBuyerOrders)

app.use(errorHandlerMiddleware)

const startServer = async () => {
  await startBuyerOrderConsumer()

  app.listen(port, "0.0.0.0", () => {
    console.log(`Buyer Domain Service running on port ${port}`)
  })
}

startServer().catch((error) => {
  console.error("Failed to start Buyer Service", error)
  process.exit(1)
})
