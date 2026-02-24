import "dotenv/config"
import express from "express"

import { signup, login } from "./router/auth.js"
import appLogger from "./logger/appLogger.js"

import accessLoggerMiddleware from "./middleware/accessLogger.js"
import { strictRequestIdMiddleware } from "./middleware/strictReqIdmiddleware.js"
import errorHandlerMiddleware from "./middleware/errorHandler.js"

import "./worker/roleUpdater.js"

const app = express()
const port = 4001

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "AUTH_SERVICE"
  })
})

app.use(express.json())
app.use(accessLoggerMiddleware)
app.use(strictRequestIdMiddleware)

app.post("/auth/signup", signup)
app.post("/auth/login", login)

app.use(errorHandlerMiddleware)

app.listen(port, "0.0.0.0", () => {
  console.log("Auth service running at port 4001")
  appLogger.info({
    event: "AUTH_SERVICE_STARTED",
    port
  })
})
