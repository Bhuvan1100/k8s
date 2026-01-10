import express from "express";
import prisma from "../config/prismaClient.js";

const router = express.Router();

router.post("/add-detail", async (req, res) => {
  try {
    const {
      userId,
      businessName,
      sellerType,
      email,
      phone,
      panNumber,
      gstNumber,
      address
    } = req.body;

    if (!userId || !businessName || !sellerType || !email) {
      return res.status(400).json({
        message: "Missing required seller fields"
      });
    }

    const seller = await prisma.seller.create({
      data: {
        userId,
        businessName,
        sellerType,
        email,
        phone,
        panNumber,
        gstNumber,
        status: "PENDING",
        kycStatus: panNumber || gstNumber ? "PENDING" : "NOT_SUBMITTED",
        address: address
          ? {
              create: {
                line1: address.line1,
                line2: address.line2,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                country: address.country
              }
            }
          : undefined
      }
    });

    return res.status(201).json({
      message: "Seller profile created successfully",
      seller
    });
  } catch (error) {
    console.error("SELLER DETAIL ERROR:", error);

    return res.status(500).json({
      message: "Failed to create seller profile",
      error: error.message
    });
  }
});

export default router;
