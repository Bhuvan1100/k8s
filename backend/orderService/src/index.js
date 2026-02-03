import express from "express"
import dotenv from "dotenv"

import { connectProducer } from "./producer/producer.js"

import { checkAndReserveInventory, requestReturn } from "./routes/order.js"
import { handlePayment } from "./routes/payment.js"
import { getOrderStatus } from "./routes/orderStatus.js"
import {startOrderLifecycleCron} from "./cron/orderLifecycleCron.js"
import { checkoutPreview } from "./routes/softcheckout.js"
import { fillCheckoutSessionDetails } from "./routes/checkoutDetails.js"
import {commitCheckoutSession} from "./routes/commit.js"

const app = express()
dotenv.config()
app.use(express.json())

startOrderLifecycleCron()

app.post("/order", checkAndReserveInventory)
app.get("/order/:orderId/status", getOrderStatus)
app.post("/order/:orderId/return", requestReturn)
app.post("/checkout/preview",checkoutPreview)
app.post("/checkout/session/details", fillCheckoutSessionDetails)
app.post("/checkout/session/commit", commitCheckoutSession)
app.post("/orders/payment", handlePayment)


const start = async () => {
  await connectProducer();

  app.listen(4005, () => {
    console.log("Order service running on port 4005");
  });
};

start();