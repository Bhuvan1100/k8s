import axios from "axios";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const response = await axios.post(
      "http://localhost:4001/login",
      req.body
    );

    const { userId, role , email} = response.data;

    const token = jwt.sign(
      { userId, role },
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
      userId,
      role,
      email
    });
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

    const { userId, role, email } = response.data;

    const token = jwt.sign(
      { userId, role },
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
      userId,
      role,
      email
    });
  } catch (err) {
    res.status(500).json({ message: "Auth service signup failed" });
  }
};
