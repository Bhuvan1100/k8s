import dotenv from "dotenv";
dotenv.config();

import express from "express";
import accessLoggerMiddleware from "./middleware/accessLogger.js";

import "./worker/email-orderCreated.js";
import "./worker/email-orderedItem.js";

const app = express();

app.use(express.json());
app.use(accessLoggerMiddleware);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 4003;

app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});
