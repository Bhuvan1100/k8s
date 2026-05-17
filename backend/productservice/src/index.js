import "dotenv/config"
import express from "express"

import accessLoggerMiddleware from "./middleware/accessLogger.js"
import errorHandlerMiddleware from "./middleware/errorHandler.js"
import { strictRequestIdMiddleware } from "./middleware/strictReqIdmiddleware.js"

import { addProduct, deleteProduct } from "./router/addProduct.js"
import { getProductDetail } from "./router/getProductDetail.js"
import { addComment, addRating } from "./router/reviewProduct.js"
import { softCheckProducts } from "./router/softcheck.js"
import { reserveInventory } from "./router/inventoryReserve.js"
import { getCartProductForUI } from "./router/getCartProductUI.js"

import { startInventoryConsumer } from "./consumer/inventoryDecrease.consumer.js"
import { startInventoryFailureConsumer } from "./consumer/inventoryRelease.consumer.js"
import { getVariantPrice } from "./router/getVarientPrice.js"
import { updateVariantPrice } from "./router/updatePrice.js"

const app = express()
const port = process.env.PORT || 4003

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "PRODUCT_SERVICE"
  })
})


app.use(express.json())
app.use(accessLoggerMiddleware)
app.use(strictRequestIdMiddleware)

app.post("/seller/product", addProduct)
app.delete("/seller/product/:productId", deleteProduct)

app.post("/product/rate/:productId", addRating)
app.post("/product/comment/:productId", addComment)
app.post("/product/reserve", reserveInventory)

app.post("/product/cart/ui", getCartProductForUI)

app.get("/product/productdetail/:productId", getProductDetail)
app.post("/product/softcheck", softCheckProducts)

app.post("/internal/variants/pricing-context",getVariantPrice)
app.post("/internal/update_price",updateVariantPrice)

app.use(errorHandlerMiddleware)

const startServer = async () => {
  await startInventoryConsumer()
  await startInventoryFailureConsumer()

  app.listen(port, "0.0.0.0", () => {
    console.log(`Product Service running on port ${port}`)
  })
}

startServer().catch((error) => {
  console.error("Failed to start Product Service", error)
  process.exit(1)
})
