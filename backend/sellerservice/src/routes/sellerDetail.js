import prisma from "../config/prismaClient.js";
import { roleUpdaterQueue } from "../queue/roleUpdater.js";

export const createSellerDetail = async (req, res) => {
  const requestId = req.headers["x-request-id"];

  console.log("SELLER SERVICE | CREATE SELLER", { requestId });

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

    const finalUserId = req.user?.userId || userId;

    if (!finalUserId || !businessName || !sellerType || !email) {
      return res.status(400).json({
        message: "Missing required seller fields"
      });
    }

    const existingSeller = await prisma.seller.findUnique({
      where: { userId: finalUserId }
    });

    if (existingSeller) {
      return res.status(200).json({
        message: "Seller already exists for this user",
        existingSeller
      });
    }

    const seller = await prisma.$transaction(async (tx) => {
      return tx.seller.create({
        data: {
          userId: finalUserId,
          businessName,
          sellerType,
          email,
          phone,
          panNumber,
          gstNumber,
          status: "ACTIVE",
          isVerified: true,
          kycStatus: "VERIFIED",
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
    });
    await roleUpdaterQueue.add(
      "update-role",
      {
        userId: finalUserId,
        newRole: "SELLER"
      },
      {
        jobId: `role-update-${finalUserId}`, // idempotent
        removeOnComplete: true
      }
    );


    

    res.status(201).json({
      message: "Seller created successfully",
      sellerId: seller.id
    });
  } catch (err) {
    console.error("SELLER SERVICE ERROR", {
      requestId,
      error: err.message
    });

    

    res.status(500).json({
      message: "Failed to create seller"
    });
  }
};
