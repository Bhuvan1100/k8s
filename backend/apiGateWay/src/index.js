import "dotenv/config";
import express from "express"
import cookieParser from "cookie-parser";
import jwtCookieMiddleware from "./middleware/verification.js";
import { prometheusMiddleware, prometheusMetricsEndpoint } from "./metrics/prometheus.js";
import {login , signup} from "./router/auth.js"
import rateLimitMiddleware from "./middleware/rateLimit.js";



const app = express()
const port = 4000

app.use(rateLimitMiddleware)
app.use(express.json())
app.use(cookieParser());  
app.use(prometheusMiddleware);

app.get('/metrics', prometheusMetricsEndpoint)


app.post("/login", login);
app.post("/signup", signup);


app.use(jwtCookieMiddleware)




app.listen(port,()=>{
    console.log('ApiGateway is running at port 4000')
})