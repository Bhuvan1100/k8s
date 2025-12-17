import prisma from "../utils/prismaClient.js";

const ORIGIN_MAP = {
  "https://buyer.cartcraft.com": "BUYER",
  "https://seller.cartcraft.com": "SELLER",
  "http://localhost:3000": "BUYER",
  "http://localhost:3001": "SELLER"
};

export const signup = async (req, res) => {
  try {
    const { email, firebase_id } = req.body;
    const origin = req.headers.origin;
    
    const role = ORIGIN_MAP[origin]    

    if (!firebase_id) {
      return res.status(400).json({ message: "firebase_id required" });
    }

    if (!role) {
      return res.status(400).json({ message: "Invalid or unsupported origin" });
    }

    let user = await prisma.user.findUnique({
      where: { userId: firebase_id }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          userId: firebase_id,
          email,
          roles: [role]
        }
      });
    } else if (!user.roles.includes(role)) {
      user = await prisma.user.update({
        where: { userId: firebase_id },
        data: {
          roles: {
            push: role
          }
        }
      });
    }

    console.log("user created");

    return res.json({
      message: "Signup successful",
      id: user.userId,
      email: user.email,
      roles: user.roles
    });

  } catch (err) {
    console.error("SIGNUP ERROR 👉", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};



export const login = async (req, res) => {
  const { firebase_id } = req.body;

  if (!firebase_id) {
    return res.status(400).json({ message: "firebase_id required" });
  }

  const user = await prisma.user.findUnique({
    where: { userId: firebase_id }
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({
    message: "Login successful",
    id:user.userId,
    email:user.email,
    roles: user.roles,
  });
};
