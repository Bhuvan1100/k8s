import express from "express";
import accessLoggerMiddleware from "./middleware/accessLogger";
const app = express();
const PORT = process.env.PORT || 4002;

app.use(express.json());
app.use(accessLoggerMiddleware)


app.put("/profile/update-number", (req, res) => {
  res.status(501).json({ message: "Update profile route" });
});

app.post("/address/add", (req, res) => {
  res.status(501).json({ message: "Add address route" });
});

app.put("/address/update/:addressId", (req, res) => {
  res.status(501).json({ message: "Update address route" });
});

app.delete("/address/delete/:addressId", (req, res) => {
  res.status(501).json({ message: "Delete address route" });
});

app.get("/address", (req, res) => {
  res.status(501).json({ message: "Get addresses route" });
});

app.post("/cart/add", (req, res) => {
  res.status(501).json({ message: "Add to cart route" });
});

app.delete("/cart/remove/:productId", (req, res) => {
  res.status(501).json({ message: "Remove from cart route" });
});

app.get("/cart", (req, res) => {
  res.status(501).json({ message: "Get cart route" });
});

app.post("/order/place", (req, res) => {
  res.status(501).json({ message: "Place order route" });
});

app.get("/order/current", (req, res) => {
  res.status(501).json({ message: "Get current order route" });
});

app.get("/order/history", (req, res) => {
  res.status(501).json({ message: "Get order history route" });
});

app.listen(PORT, () => {
  console.log(`Buyer Domain Service running on port ${PORT}`);
});
