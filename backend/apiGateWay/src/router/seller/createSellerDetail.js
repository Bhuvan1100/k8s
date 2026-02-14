import axios from "axios";

import appLogger from "../../logger/appLogger.js"
import errorLogger from "../../logger/errorLogger.js"
import accessLogger from "../../logger/accesslogger.js"

export const createSellerDetail = async (req, res) => {
  console.log("SELLER DETAIL request received", {
    requestId: req.requestId,
  });

  try {
    const response = await axios.post(
      "http://sellerservice:4007/seller/sellerdetail",
      req.body,
      {
        headers: {
          "x-request-id": req.requestId
        }
      }
    );

    appLogger.info({
      requestId: req.requestId,
      event: "SELLER_DETAIL_CREATED",
      responseStatus: response.status,
    });

    accessLogger.info({
      requestId: req.requestId,
      action: "CREATE_SELLER_DETAIL",
      status: response.status,
    });

    console.log("SELLER DETAIL response sent", {
      requestId: req.requestId,
      status: response.status,
    });

    res.status(response.status).json(response.data);

  } catch (err) {
    console.error("GATEWAY SELLER DETAIL ERROR", {
      requestId: req.requestId,
      message: err.message,
    });

    errorLogger.error({
      requestId: req.requestId,
      event: "SELLER_DETAIL_FAILED",
      error: err.message,
      status: err.response?.status,
    });

    res.status(err.response?.status || 500).json({
      message: "Seller service request failed",
    });
  }
};
