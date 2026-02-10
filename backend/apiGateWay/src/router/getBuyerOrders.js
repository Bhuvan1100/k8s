import axios from "axios";

import appLogger from "../logger/appLogger.js";
import errorLogger from "../logger/errorLogger.js";

export const getBuyerOrders = async (req, res) => {
  console.log("GET_BUYER_ORDERS request received", {
    requestId: req.requestId
  });

  try {
    const response = await axios.post(
      "http://buyerservice:4002/buyer/orders",
      req.body,
      {
        headers: {
          "x-request-id": req.requestId
        }
      }
    );

    appLogger.info({
      requestId: req.requestId,
      event: "GET_BUYER_ORDERS_SUCCESS",
      status: response.status
    });

    return res.status(response.status).json(response.data);

  } catch (error) {
    console.error("GET_BUYER_ORDERS error", {
      requestId: req.requestId,
      message: error.message
    });

    errorLogger.error({
      requestId: req.requestId,
      event: "GET_BUYER_ORDERS_FAILED",
      error: error.message,
      status: error.response?.status
    });

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    return res.status(500).json({
      message: "Buyer service unavailable"
    });
  }
};
