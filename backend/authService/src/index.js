import "dotenv/config";
import express from "express";
import { signup, login } from "./router/auth.js";
import appLogger from "./logger/appLogger.js";
import accessLoggerMiddleware from "./middleware/accessLogger.js";
import "./worker/roleUpdater.js"


import errorHandlerMiddleware from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use(accessLoggerMiddleware)

app.post('/auth/signup',signup);
app.post('/auth/login', login)

app.use(errorHandlerMiddleware)

const PORT = 4001;
app.listen(PORT,"0.0.0.0", () => {
  console.log(`Auth Service running on port ${PORT}`)
  appLogger.info(`Auth Service running on port ${PORT}`);
});
