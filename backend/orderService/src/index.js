import express from "express"
import dotenv from "dotenv"

import { checkAndReserveInventory, requestReturn } from "./routes/order.js"
import { handlePaymentResult } from "./routes/payment.js"
import { getOrderStatus } from "./routes/orderStatus.js"
import { startOrderLifecycleCron } from "./cron/orderLifeCycleCron.js"

const app = express()
dotenv.config()
app.use(express.json())

startOrderLifecycleCron()

app.post("/order", checkAndReserveInventory)
app.post("/order/:orderId/payment", handlePaymentResult)
app.get("/order/:orderId/status", getOrderStatus)
app.post("/order/:orderId/return", requestReturn)




app.listen(4010, ()=>{
    console.log('Seller service has started at port 4010')
})