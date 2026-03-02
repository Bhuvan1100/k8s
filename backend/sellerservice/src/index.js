import "dotenv/config"
import express from "express"

import accessLoggerMiddleware from "./middleware/accessLogger.js"
import errorHandlerMiddleware from "./middleware/errorHandler.js"
import { strictRequestIdMiddleware } from "./middleware/strictReqIdmiddleware.js"

import { startSellerOrderConsumer } from "./consumer/sellerOrder.consumer.js"
import "./worker/addItems.js"
import "./worker/updateOrderStatus.js"

import { createSellerDetail } from "./routes/sellerDetail.js"
import { getSellerOrders } from "./routes/getSellerOrders.js"

const app = express()
const port = process.env.PORT || 4007

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "SELLER_SERVICE"
  })
})



app.use(express.json())
app.use(accessLoggerMiddleware)
app.use(strictRequestIdMiddleware)

app.post("/seller/sellerdetail", createSellerDetail)
app.post("/seller/orders",getSellerOrders)

app.use(errorHandlerMiddleware)

const startServer = async () => {
  await startSellerOrderConsumer()

  app.listen(port, "0.0.0.0", () => {
    console.log(`Seller Service running on port ${port}`)
  })
}

startServer().catch((error) => {
  console.error("Failed to start Seller Service", error)
  process.exit(1)
})
