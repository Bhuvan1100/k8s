import "dotenv/config";
import express from "express"
import cookieParser from "cookie-parser";
import jwtCookieMiddleware from "./middleware/verification.js";
import { prometheusMiddleware, prometheusMetricsEndpoint } from "./metrics/prometheus.js";
import rateLimitMiddleware from "./middleware/rateLimit.js";


import {login , signup} from "./router/auth.js"
import { addProduct, deleteProduct } from "./router/seller.js";




const app = express()
const port = 4000


// app.use(prometheusMiddleware);
// app.use(jwtCookieMiddleware)
// app.use(rateLimitMiddleware)
app.use(express.json());
app.use(cookieParser());  


app.get('/metrics', prometheusMetricsEndpoint)


app.post("/auth/login", login);
app.post("/auth/signup", signup);
app.post("/seller/product", addProduct)
app.delete("/seller/product", deleteProduct)







app.listen(port,()=>{
    console.log('ApiGateway is running at port 4000')
})