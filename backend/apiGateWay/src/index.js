import "dotenv/config"
import express from "express"
import cookieParser from "cookie-parser"

import {
  prometheusMiddleware,
  prometheusMetricsEndpoint
} from "./metrics/prometheus.js"

import { requestIdMiddleware } from "./middleware/requestId.js"
import rateLimitMiddleware from "./middleware/rateLimit.js"
import accessLoggerMiddleware from "./middleware/accessLogger.js"
import errorHandlerMiddleware from "./middleware/errorHandler.js"
import jwtCookieMiddleware from "./middleware/verification.js"

import verifyUser from "./router/verify.js"
import { login, signup } from "./router/auth.js"

import {
  addProduct,
  deleteProduct,
  getCartProductForUI
} from "./router/product.js"

import {
  commentProduct,
  rateProduct
} from "./router/review.js"

import { getProduct } from "./router/productDetail.js"

import {
  getProductsByCategory,
  getProductsByQuery
} from "./router/search.js"

import {
  addItemToCart,
  deleteCartItem,
  updateCartItem,
  getCartItemsforUserContext
} from "./router/cart.js"

import {
  proceedToCheckout,
  fillCheckoutDetails,
  commitCheckoutSession
} from "./router/order.js"

import { paymentCallback } from "./router/payment.js"
import { createSellerDetail } from "./router/seller.js"

import { getOrderStatus } from "./router/getOrderStatus.js"
import { getBuyerOrders } from "./router/getBuyerOrders.js"
import { getSellerOrders } from "./router/getSellerOrders.js"

import appLogger from "./logger/appLogger.js"

const app = express()
const port = 4000

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "API_GATEWAY"
  })
})

app.get("/metrics", prometheusMetricsEndpoint)

app.use(requestIdMiddleware)
app.use(prometheusMiddleware)
app.use(rateLimitMiddleware)
app.use(express.json())
app.use(cookieParser())

app.post("/verifyUser", verifyUser)
app.post("/auth/login", login)
app.post("/auth/signup", signup)

app.use(accessLoggerMiddleware)
app.use(jwtCookieMiddleware)

app.post("/seller/product", addProduct)
app.delete("/seller/product/:productId", deleteProduct)
app.post("/seller/sellerdetail", createSellerDetail)

app.post("/product/cart/ui", getCartProductForUI)
app.post("/product/comment/:productId", commentProduct)
app.post("/product/rate/:productId", rateProduct)
app.get("/product/productdetail/:productId", getProduct)

app.get("/products/:category/:subCategory", getProductsByCategory)
app.get("/search/:query", getProductsByQuery)

app.post("/buyer/cart/additem", addItemToCart)
app.patch("/buyer/cart/update", updateCartItem)
app.delete("/buyer/cart/delete", deleteCartItem)
app.post("/buyer/cart/getcart", getCartItemsforUserContext)

app.post("/checkout/preview", proceedToCheckout)
app.post("/checkout/session/details", fillCheckoutDetails)
app.post("/checkout/session/commit", commitCheckoutSession)

app.post("/order/payment", paymentCallback)

app.post("/admin/orders/status", getOrderStatus)
app.post("/buyer/orders", getBuyerOrders)
app.post("/seller/orders",getSellerOrders)



app.use(errorHandlerMiddleware)

app.listen(port, "0.0.0.0", () => {
  appLogger.info({
    event: "API_GATEWAY_STARTED",
    port
  })
})
