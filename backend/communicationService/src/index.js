import "dotenv/config"
import express from "express"

import accessLoggerMiddleware from "./middleware/accessLogger.js"
import { strictRequestIdMiddleware } from "./middleware/strictReqIdmiddleware.js"

import "./worker/email-orderCreated.js"
import "./worker/email-orderedItem.js"

const app = express()
const port = process.env.PORT || 4008

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "NOTIFICATION_SERVICE"
  })
})


app.use(express.json())
app.use(accessLoggerMiddleware)
app.use(strictRequestIdMiddleware)

app.listen(port, "0.0.0.0", () => {
  console.log(`Notification Service running on port ${port}`)
})
