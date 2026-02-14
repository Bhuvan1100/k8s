import "dotenv/config"
import express from "express"

import accessLoggerMiddleware from "./middleware/accessLogger.js"
import errorHandlerMiddleware from "./middleware/errorHandler.js"
import { strictRequestIdMiddleware } from "./middleware/strictReqIdmiddleware.js"

import "./worker/addDeleteProduct.js"
import "./worker/decreaseProduct.js"
import "./worker/updateRating.js"

import { getProductsByCategory } from "./routes/category.js"
import { getProductsByQuery } from "./routes/query.js"

const app = express()
const port = process.env.PORT || 4005

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "SEARCH_SERVICE"
  })
})

app.use(express.json())
app.use(accessLoggerMiddleware)
app.use(strictRequestIdMiddleware)

app.post("/products/:category/:subCategory", getProductsByCategory)
app.post("/search/:query", getProductsByQuery)

app.use(errorHandlerMiddleware)

app.listen(port, "0.0.0.0", () => {
  console.log(`Search Service running on port ${port}`)
})
