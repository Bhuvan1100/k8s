import axios from "axios";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const response = await axios.post(
      "http://localhost:4001/signup",
      req.body,
      {
        headers: {
          origin: req.headers.origin
        }
      }
    );

    const { id, email, roles } = response.data;
    const role = roles[0];

    const token = jwt.sign(
      { userId: id, role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(response.status).json({
      message: "sign-up successful",
      id,
      email,
      role
    });

  } catch (err) {
    console.error("GATEWAY SIGNUP ERROR →", err.message);
    res.status(500).json({ message: "Auth service signup failed" });
  }
};

export const login = async (req, res) => {
  try {
    const response = await axios.post(
      "http://localhost:4001/login",
      req.body,
      {
        headers: {
          origin: req.headers.origin
        }
      }
    );

    const { id, email, roles } = response.data;
    const role = roles[0];

    const token = jwt.sign(
      { userId: id, role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(response.status).json({
      message: "login successful",
      id,
      email,
      role
    });

  } catch (err) {
    res.status(500).json({ message: "Auth service login failed" });
  }
};
