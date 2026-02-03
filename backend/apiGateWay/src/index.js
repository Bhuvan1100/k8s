import "dotenv/config"
import express from "express"
import cookieParser from "cookie-parser"

import {
  prometheusMiddleware,
  prometheusMetricsEndpoint
} from "./metrics/prometheus.js"

import { requestIdMiddleware } from "./middleware/requestId.js"
import accessLoggerMiddleware from "./middleware/accessLogger.js"
import errorHandlerMiddleware from "./middleware/errorHandler.js"
import rateLimitMiddleware from "./middleware/rateLimit.js"

import { login, signup } from "./router/auth.js"
import { addProduct, deleteProduct } from "./router/product.js"
import { commentProduct, rateProduct } from "./router/review.js"
import { getProduct } from "./router/productDetail.js"
import { getProductsByCategory, getProductsByQuery } from "./router/search.js"
import {
  addItemToCart,
  deleteCartItem,
  updateCartItem,
  getCartItems
} from "./router/cart.js"

import {
  proceedToCheckout,
  fillCheckoutDetails,
  commitCheckoutSession
} from "./router/order.js"

import { paymentCallback } from "./router/payment.js"

import { createSellerDetail } from "./router/seller.js"

import appLogger from "./logger/appLogger.js"

const app = express()
const port = 4000

app.get("/health", (req, res) => {
  console.log("Health check endpoint hit")
  res.status(200).send("GATEWAY OK")
})

app.get("/metrics", prometheusMetricsEndpoint)

app.use(prometheusMiddleware)
app.use(rateLimitMiddleware)
app.use(express.json())
app.use(cookieParser())
app.use(requestIdMiddleware)
app.use(accessLoggerMiddleware)

app.post("/auth/login", login)
app.post("/auth/signup", signup)

app.post("/seller/product", addProduct)
app.delete("/seller/product/:productId", deleteProduct)

app.post("/product/comment/:productId", commentProduct)
app.post("/product/rate/:productId", rateProduct)
app.get("/product/productdetail/:productId", getProduct)

app.get("/products/:category/:subCategory", getProductsByCategory)
app.get("/search/:query", getProductsByQuery)

app.post("/buyer/cart/additem", addItemToCart)
app.patch("/buyer/cart/update", updateCartItem)
app.delete("/buyer/cart/delete", deleteCartItem)
app.post("/buyer/cart/getcart", getCartItems)

app.post("/checkout/preview", proceedToCheckout)
app.post("/checkout/session/details", fillCheckoutDetails)
app.post("/checkout/session/commit", commitCheckoutSession)

app.post("/seller/sellerdetail", createSellerDetail)

app.post("/order/payment", paymentCallback)

app.use(errorHandlerMiddleware)

app.listen(port, "0.0.0.0", () => {
  console.log(`ApiGateway is running at port ${port}`)

  appLogger.info({
    event: "API_GATEWAY_STARTED",
    port
  })
})
