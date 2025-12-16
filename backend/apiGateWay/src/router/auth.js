import axios from "axios";


export const login = async (req, res) => {
  try {
    const response = await axios.post(
      "http://localhost:4001/login", 
      req.body
    );
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ message: "Auth service login failed" });
  }
};



export const signup = async (req, res) => {
  try {
    const response = await axios.post(
      "http://localhost:4001/signup", 
      req.body
    );
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ message: "Auth service signup failed" });
  }
};
