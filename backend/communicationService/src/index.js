import express from "express";
import dotenv from "dotenv";

import "./worker/email-orderCreated.js"
import "./worker/email-orderedItem.js"

dotenv.config();

const app = express();


app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});
