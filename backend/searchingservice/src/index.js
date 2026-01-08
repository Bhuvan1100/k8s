import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 4007;

app.get("/health", (req, res) => {
  res.json({ status: "Search Service running" });
});

app.listen(PORT, () => {
  console.log(` Search Service running on port ${PORT}`);
});
