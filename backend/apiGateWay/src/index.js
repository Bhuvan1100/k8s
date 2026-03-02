import "dotenv/config"
import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

import {
  prometheusMiddleware,
  prometheusMetricsEndpoint
} from "./metrics/prometheus.js"

import { requestIdMiddleware } from "./middleware/requestId.js"
import rateLimitMiddleware from "./middleware/rateLimit.js"
import accessLoggerMiddleware from "./middleware/accessLogger.js"
import errorHandlerMiddleware from "./middleware/errorHandler.js"
import jwtCookieMiddleware from "./middleware/verification.js"

import appLogger from "./logger/appLogger.js"

import verifyUser from "./router/auth/verify.js"
import { login } from "./router/auth/login.js"
import { signup } from "./router/auth/signup.js"

import { createSellerDetail } from "./router/seller/createSellerDetail.js"
import { addProduct } from "./router/seller/addProduct.js"
import { deleteProduct } from "./router/seller/deleteProduct.js"

import { getProductDetail } from "./router/product/getProductDetails.js"
import { getCartProductForUI } from "./router/product/getCartProductUI.js"

import { commentProduct } from "./router/review/comment.js"
import { rateProduct } from "./router/review/rate.js"

import { getProductsByCategory } from "./router/productSearch/searchByCategory.js"
import { getProductsByQuery } from "./router/productSearch/searchByQuery.js"

import { addItemToCart } from "./router/cart/addItemToCart.js"
import { clearCart } from "./router/cart/clearCart.js"
import { updateCartItem } from "./router/cart/updateItems.js"
import { deleteCartItem } from "./router/cart/deleteItem.js"
import { getCartItemsforUserContext } from "./router/cart/getItemForUser.js"

import { proceedToCheckout } from "./router/checkout/proceedToCheckout.js"
import { fillCheckoutDetails } from "./router/checkout/fillUserDetails.js"
import { commitCheckoutSession } from "./router/checkout/commitCheckout.js"

import { getBuyerOrders } from "./router/orders/getBuyerOrder.js"
import { getSellerOrders } from "./router/orders/getSellerOrder.js"
import { getOrderStatusForAdmin } from "./router/orders/getOrderStatus.js"

import { paymentCallback } from "./router/payment/commitPayment.js"

import { approveProposal } from "./router/pricing/approveProposal.js"
import { rejectProposal } from "./router/pricing/rejectProposal.js"
import { fetchProposals } from "./router/pricing/fetchProposal.js"

const app = express()
const port = 4000

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "API_GATEWAY"
  })
})



app.use(cors({
  origin :  "http://localhost:5173",
  credentials: true})
)
app.set("trust proxy", 1);

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
app.get("/product/productdetail/:productId", getProductDetail)

app.post("/product/comment/:productId", commentProduct)
app.post("/product/rate/:productId", rateProduct)

app.get("/products/:category/:subCategory", getProductsByCategory)
app.get("/search/:query", getProductsByQuery)

app.post("/buyer/cart/additem", addItemToCart)
app.patch("/buyer/cart/update", updateCartItem)
app.delete("/buyer/cart/delete", deleteCartItem)
app.post("/buyer/cart/getcart", getCartItemsforUserContext)
app.post("/buyer/cart/clear",clearCart)

app.post("/checkout/preview", proceedToCheckout)
app.post("/checkout/session/details", fillCheckoutDetails)
app.post("/checkout/session/commit", commitCheckoutSession)

app.post("/order/payment", paymentCallback)

app.post("/admin/orders/status", getOrderStatusForAdmin)
app.post("/buyer/orders", getBuyerOrders)
app.post("/seller/orders", getSellerOrders)

app.post("/proposals/:proposal_id/approve", approveProposal)
app.post("/proposals/:proposal_id/reject", rejectProposal)
app.get("/proposals", fetchProposals)



app.use(errorHandlerMiddleware)

app.listen(port, "0.0.0.0", () => {
  console.log("ApiGateWay running at port 4000")
  appLogger.info({
    event: "API_GATEWAY_STARTED",
    port
  })
})