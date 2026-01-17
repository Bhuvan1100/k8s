import express from "express";
import { signup, login } from "./router/routing.js";
import appLogger from "./logger/appLogger.js";
import accessLoggerMiddleware from "./middleware/accessLogger.js";


const app = express();

app.use(express.json());
app.use(accessLoggerMiddleware)

app.post('/signup',signup);
app.post('/login', login)

const PORT = 4001;
app.listen(PORT, () => {
  appLogger.info(`Auth Service running on port ${PORT}`);
});
