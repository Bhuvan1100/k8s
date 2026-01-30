import axios from "axios";
import prisma from "../config/prismaClient.js";

export const checkoutPreview = async (req, res) => {
  try {
    const requestId = req.headers["x-request-id"];

    const cartResponse = await axios.post(
      "http://buyerservice:4002/buyer/cart/cartcheckout",
      req.body,
      {
        headers: {
          "x-request-id": requestId
        }
      }
    );

    const cartItems = cartResponse.data?.items;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
        canProceed: false
      });
    }

    const softCheckPayload = {
      ...req.body,
      items: cartItems.map(item => ({
        productId: item.productId,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        size: item.size
      }))
    };

    const productResponse = await axios.post(
      "http://productservice:4006/product/softcheck",
      softCheckPayload,
      {
        headers: {
          "x-request-id": requestId
        }
      }
    );

    const previewItems = productResponse.data?.items || [];
    const subtotal = productResponse.data?.subtotal || 0;

    const deliveryCharge = subtotal < 500 ? 80 : 0;
    const discount = 0;
    const total = subtotal + deliveryCharge;

    const session = await prisma.checkoutSession.create({
      data: {
        userId: req.body.userId,
        cartId: cartResponse.data?.cartId,
        status: "PREVIEW",
        itemsSnapshot: previewItems,
        pricingSnapshot: {
          subtotal,
          deliveryCharge,
          discount,
          total
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    return res.status(200).json({
      ...productResponse.data,
      sessionId: session.id
    });

  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    return res.status(500).json({
      message: "Checkout preview failed"
    });
  }
};
