import "dotenv/config"
import express from "express"

import accessLoggerMiddleware from "./middleware/accessLogger.js"
import errorHandlerMiddleware from "./middleware/errorHandler.js"
import { strictRequestIdMiddleware } from "./middleware/strictReqIdmiddleware.js"

import { connectProducer } from "./producer/producer.js"

import {
  checkAndReserveInventory,
  requestReturn
} from "./routes/order.js"


import { handlePayment } from "./routes/payment.js"
import { getOrderStatus } from "./routes/getOrderStatus.js"
import { checkoutPreview } from "./routes/softcheckout.js"
import { fillCheckoutSessionDetails } from "./routes/checkoutDetails.js"
import { commitCheckoutSession } from "./routes/commit.js"


import { startOrderLifecycleCron } from "./cron/orderLifecycleCron.js"

const app = express()
const port = process.env.PORT || 4005

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "ORDER_SERVICE"
  })
})

app.use(express.json())
app.use(accessLoggerMiddleware)
app.use(strictRequestIdMiddleware)

startOrderLifecycleCron()

app.post("/order", checkAndReserveInventory)

app.post("/order/:orderId/return", requestReturn)

app.post("/checkout/preview", checkoutPreview)
app.post("/checkout/session/details", fillCheckoutSessionDetails)
app.post("/checkout/session/commit", commitCheckoutSession)

app.post("/orders/payment", handlePayment)

app.post("/admin/orders/status", getOrderStatus)

app.use(errorHandlerMiddleware)

const start = async () => {
  await connectProducer()

  app.listen(port, "0.0.0.0", () => {
    console.log(`Order Service running on port ${port}`)
  })
}

start()
