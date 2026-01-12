import axios from "axios";

export const addProduct = async (req, res) => {
  try {
    const response = await axios.post(
      "http://localhost:4003/seller/product",
      req.body,
    );

    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ message: "Seller service failed" });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const response = await axios.delete(
      "http://localhost:4003/seller/product",
      {
        data: req.body
      }
    );

    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ message: "Seller service failed" });
  }
};

